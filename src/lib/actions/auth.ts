"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";
import type { UserProfile, UserRole } from "@/types/database";

// Admin roles that should redirect to admin dashboard
const adminRoles: UserRole[] = [
  "superadmin",
  "campus_admin",
  "admissions",
  "financial_aid",
  "instructor",
  "registrar",
  "auditor",
];

export type AuthResult = {
  success: boolean;
  error?: string;
  redirectTo?: string;
};

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }

  // Fetch user profile to determine redirect
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();

  // Block deactivated accounts
  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "This account has been deactivated. Please contact an administrator.",
    };
  }

  // Update last login timestamp
  await supabase
    .from("user_profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.user.id);

  // Determine redirect based on role
  const redirectTo =
    profile?.role === "instructor"
      ? "/instructor/dashboard"
      : profile?.role && adminRoles.includes(profile.role)
      ? "/admin/dashboard"
      : "/dashboard";

  revalidatePath("/", "layout");

  return {
    success: true,
    redirectTo,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Get the current authenticated user with their profile
 */
export async function getUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile;
  } catch (error: any) {
    // Re-throw Next.js internal errors (DYNAMIC_SERVER_USAGE, redirects, etc.)
    if (error?.digest) {
      throw error;
    }
    console.error("[getUser] Error:", error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env["NEXT_PUBLIC_SITE_URL"]}/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Update password for authenticated user
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Register a new user (creates auth user + profile)
 * This is typically used for staff accounts created by admins
 */
export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = "student",
  phone?: string
): Promise<AuthResult> {
  // Verify caller is superadmin
  const caller = await getUser();
  if (!caller || caller.role !== "superadmin") {
    return { success: false, error: "Only superadmins can create users." };
  }

  const adminSupabase = createAdminClient();

  // Create auth user
  const { data: authData, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: "Failed to create user account.",
    };
  }

  // Create user profile
  const { error: profileError } = await adminSupabase
    .from("user_profiles")
    .insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      phone: phone || null,
    });

  if (profileError) {
    // Rollback: delete the auth user if profile creation fails
    await adminSupabase.auth.admin.deleteUser(authData.user.id);
    return {
      success: false,
      error: "Failed to create user profile.",
    };
  }

  revalidatePath("/admin/settings");

  return {
    success: true,
  };
}

/**
 * Update a user's role (superadmin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<AuthResult> {
  const caller = await getUser();
  if (!caller || caller.role !== "superadmin") {
    return { success: false, error: "Only superadmins can change roles." };
  }

  if (caller.id === userId) {
    return { success: false, error: "You cannot change your own role." };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("user_profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

/**
 * Check if user has a specific role
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if user is any admin role
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(adminRoles);
}

/**
 * Check if user is a student
 */
export async function isStudent(): Promise<boolean> {
  return hasRole(["student"]);
}

/**
 * Update the current user's profile (phone, name)
 */
export async function updateProfile(data: {
  phone?: string;
  first_name?: string;
  last_name?: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updateData: Record<string, string | null> = {};
  if (data.phone !== undefined) updateData["phone"] = data.phone || null;
  if (data.first_name !== undefined) updateData["first_name"] = data.first_name;
  if (data.last_name !== undefined) updateData["last_name"] = data.last_name;

  const { error } = await supabase
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/profile");
  revalidatePath("/instructor/profile");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Toggle user active status (superadmin only)
 */
export async function toggleUserActive(userId: string): Promise<AuthResult> {
  const caller = await getUser();
  if (!caller || caller.role !== "superadmin") {
    return { success: false, error: "Only superadmins can deactivate users." };
  }

  if (caller.id === userId) {
    return { success: false, error: "You cannot deactivate your own account." };
  }

  const adminSupabase = createAdminClient();

  const { data: profile } = await adminSupabase
    .from("user_profiles")
    .select("is_active")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { success: false, error: "User not found." };
  }

  const newStatus = !profile.is_active;

  const { error } = await adminSupabase
    .from("user_profiles")
    .update({ is_active: newStatus })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  logAudit({
    table_name: "user_profiles",
    record_id: userId,
    action: "update",
    old_data: { is_active: profile.is_active },
    new_data: { is_active: newStatus },
  }).catch(() => {});

  revalidatePath("/admin/settings");
  return { success: true };
}
