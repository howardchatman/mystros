"use server";

import { createClient } from "@/lib/supabase/server";

interface AuditParams {
  table_name: string;
  record_id: string;
  action: "create" | "update" | "delete" | "status_change" | "login" | "export";
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  changed_fields?: string[];
}

/**
 * Detect which fields changed between two objects.
 */
function detectChangedFields(
  oldData: Record<string, unknown> | null | undefined,
  newData: Record<string, unknown> | null | undefined
): string[] {
  if (!oldData || !newData) return [];
  const fields: string[] = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  for (const key of allKeys) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      fields.push(key);
    }
  }
  return fields;
}

/**
 * Fire-and-forget audit logging. Call without await.
 * Never throws — failures are logged to console only.
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userEmail: string | null = null;
    let userRole: string | null = null;
    let campusId: string | null = null;

    if (user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("email, role, campus_id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        userEmail = profile.email;
        userRole = profile.role;
        campusId = profile.campus_id;
      }
    }

    const changed =
      params.changed_fields ?? detectChangedFields(params.old_data, params.new_data);

    await supabase.from("audit_log").insert({
      table_name: params.table_name,
      record_id: params.record_id,
      action: params.action,
      user_id: user?.id ?? null,
      user_email: userEmail,
      user_role: userRole as any,
      campus_id: campusId,
      old_data: params.old_data as any,
      new_data: params.new_data as any,
      changed_fields: changed.length > 0 ? changed : null,
    });
  } catch (err) {
    console.error("[Audit] Failed to log:", err);
  }
}
