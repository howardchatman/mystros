"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Announcements ──────────────────────────────────────────────

export async function createAnnouncement(data: {
  title: string;
  body: string;
  priority?: "low" | "normal" | "high" | "urgent";
  campus_id?: string | null;
  target_audience?: string;
  expires_at?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: announcement, error } = await supabase
    .from("announcements")
    .insert({
      ...data,
      created_by: user?.id || null,
      is_published: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  return { data: announcement };
}

export async function publishAnnouncement(id: string) {
  const supabase = await createClient();

  // Publish the announcement
  const { data: announcement, error } = await supabase
    .from("announcements")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  // Create in-app notifications for target users
  const targetAudience = announcement.target_audience || "all";

  let userQuery = supabase.from("user_profiles").select("user_id, role");
  if (targetAudience === "students") {
    userQuery = userQuery.eq("role", "student");
  } else if (targetAudience === "staff") {
    userQuery = userQuery.neq("role", "student");
  }
  // "all" gets everyone

  const { data: users } = await userQuery.eq("is_active", true);

  if (users && users.length > 0) {
    const notifications = users.map((u) => ({
      user_id: u.user_id,
      title: announcement.title,
      body: announcement.body?.substring(0, 200) || "",
      category: "announcement" as const,
      priority: announcement.priority || "normal",
      link_url: null,
      related_entity_type: "announcement",
      related_entity_id: announcement.id,
    }));

    // Insert in batches of 50 to avoid payload limits
    for (let i = 0; i < notifications.length; i += 50) {
      await supabase
        .from("in_app_notifications")
        .insert(notifications.slice(i, i + 50));
    }
  }

  revalidatePath("/admin/announcements");
  return { data: announcement };
}

export async function updateAnnouncement(
  id: string,
  updates: {
    title?: string;
    body?: string;
    priority?: string;
    target_audience?: string;
    expires_at?: string | null;
  }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  return { data };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function getAnnouncements(filters?: {
  published_only?: boolean;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.published_only) {
    query = query.eq("is_published", true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data || [] };
}

// ─── User Notifications ─────────────────────────────────────────

export async function getMyNotifications(limit = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [] };

  const { data, error } = await supabase
    .from("in_app_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("in_app_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return count || 0;
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("in_app_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("in_app_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { error: error.message };
  return { success: true };
}

// ─── System Notification Helpers ────────────────────────────────

export async function notifySapAlert(
  studentId: string,
  status: string
) {
  const supabase = await createClient();

  // Get the student's user_id from their profile
  const { data: student } = await supabase
    .from("students")
    .select("user_id, first_name, last_name")
    .eq("id", studentId)
    .single();

  if (!student?.user_id) return;

  await supabase.from("in_app_notifications").insert({
    user_id: student.user_id,
    title: "SAP Status Update",
    body: `Your Satisfactory Academic Progress status has been updated to: ${status.replace(/_/g, " ")}`,
    category: "sap_alert",
    priority: status === "suspension" ? "urgent" : status === "probation" ? "high" : "normal",
    link_url: "/hours",
    related_entity_type: "sap_evaluation",
    related_entity_id: studentId,
  });
}

export async function notifyMilestoneAchieved(
  studentId: string,
  milestoneName: string
) {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .single();

  if (!student?.user_id) return;

  await supabase.from("in_app_notifications").insert({
    user_id: student.user_id,
    title: "Milestone Achieved!",
    body: `Congratulations! You've reached: ${milestoneName}`,
    category: "milestone",
    priority: "normal",
    link_url: "/milestones",
    related_entity_type: "milestone",
    related_entity_id: studentId,
  });
}

export async function notifyApplicationStatus(
  userId: string,
  status: string
) {
  const supabase = await createClient();

  const statusMessages: Record<string, { title: string; body: string; priority: string }> = {
    accepted: {
      title: "Application Accepted!",
      body: "Your application has been accepted. Next steps will be provided soon.",
      priority: "high",
    },
    denied: {
      title: "Application Update",
      body: "Your application has been reviewed. Please contact admissions for details.",
      priority: "normal",
    },
    enrolled: {
      title: "Welcome — You're Enrolled!",
      body: "You have been officially enrolled. Check your schedule and orientation details.",
      priority: "high",
    },
  };

  const msg = statusMessages[status];
  if (!msg) return;

  await supabase.from("in_app_notifications").insert({
    user_id: userId,
    title: msg.title,
    body: msg.body,
    category: "admissions",
    priority: msg.priority,
    link_url: status === "enrolled" ? "/schedule" : null,
    related_entity_type: "application",
    related_entity_id: null,
  });
}

export async function notifyDisbursementUpdate(
  studentId: string,
  status: string
) {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .single();

  if (!student?.user_id) return;

  const statusLabels: Record<string, string> = {
    released: "Your financial aid disbursement has been released",
    posted: "Your financial aid disbursement has been posted to your account",
    cancelled: "A financial aid disbursement has been cancelled",
  };

  await supabase.from("in_app_notifications").insert({
    user_id: student.user_id,
    title: "Financial Aid Update",
    body: statusLabels[status] || `Disbursement status updated to: ${status}`,
    category: "financial_aid",
    priority: "normal",
    link_url: null,
    related_entity_type: "disbursement",
    related_entity_id: studentId,
  });
}
