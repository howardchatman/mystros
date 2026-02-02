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

// ─── Audit Log Queries ──────────────────────────────────

export interface AuditLogFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
  tableName?: string;
  page?: number;
  limit?: number;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const supabase = await createClient();

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("audit_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(
      `user_email.ilike.%${filters.search}%,record_id.ilike.%${filters.search}%`
    );
  }
  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    const endDateTime = new Date(filters.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endDateTime.toISOString());
  }
  if (filters.action) {
    query = query.eq("action", filters.action);
  }
  if (filters.tableName) {
    query = query.eq("table_name", filters.tableName);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return { error: error.message };

  return {
    data: {
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

export async function exportAuditLogs(filters: AuditLogFilters = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (filters.search) {
    query = query.or(
      `user_email.ilike.%${filters.search}%,record_id.ilike.%${filters.search}%`
    );
  }
  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    const endDateTime = new Date(filters.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endDateTime.toISOString());
  }
  if (filters.action) {
    query = query.eq("action", filters.action);
  }
  if (filters.tableName) {
    query = query.eq("table_name", filters.tableName);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  const headers = ["Date", "User", "Role", "Action", "Table", "Record ID", "Changed Fields"];
  const rows = (data || []).map((log) => [
    new Date(log.created_at).toLocaleString(),
    log.user_email || "System",
    log.user_role || "",
    log.action?.replace(/_/g, " ") || "",
    log.table_name || "",
    log.record_id || "",
    log.changed_fields?.join(", ") || "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return { data: csv };
}
