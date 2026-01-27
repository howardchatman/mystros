"use client";

import { useAuth } from "@/components/providers/auth-provider";

/**
 * Hook for accessing the current user and their profile.
 * Must be used within an AuthProvider.
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { user, profile, isStudent, isAdmin, isLoading } = useUser();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <Redirect to="/login" />;
 *
 *   return <div>Welcome, {profile?.first_name}!</div>;
 * }
 * ```
 */
export function useUser() {
  return useAuth();
}

/**
 * Hook for checking if the current user has a specific role.
 *
 * @example
 * ```tsx
 * function AdminButton() {
 *   const { hasRole, isLoading } = useRole();
 *
 *   if (isLoading) return null;
 *   if (!hasRole(['superadmin', 'campus_admin'])) return null;
 *
 *   return <Button>Admin Action</Button>;
 * }
 * ```
 */
export function useRole() {
  const { profile, isLoading } = useAuth();

  const hasRole = (allowedRoles: string[]) => {
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  };

  return {
    role: profile?.role ?? null,
    hasRole,
    isLoading,
  };
}
