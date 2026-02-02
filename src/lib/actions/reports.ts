"use server";

import { createClient } from "@/lib/supabase/server";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  campusId?: string;
}

export async function getEnrollmentReport(filters?: ReportFilters) {
  const supabase = await createClient();

  let query = supabase.from("students").select("id, status, total_hours_completed, current_sap_status, campus_id, enrollment_date");

  if (filters?.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }
  if (filters?.startDate) {
    query = query.gte("enrollment_date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("enrollment_date", filters.endDate);
  }

  const { data: students, error } = await query;
  if (error) return { error: error.message };

  const statusCounts: Record<string, number> = {};
  let totalHours = 0;
  (students || []).forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    totalHours += s.total_hours_completed || 0;
  });

  return {
    data: {
      total: students?.length || 0,
      statusCounts,
      totalHours,
    },
  };
}

export async function getAttendanceReport(filters?: ReportFilters) {
  const supabase = await createClient();

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);

  let query = supabase
    .from("attendance_records")
    .select("status, actual_hours, campus_id, attendance_date");

  if (filters?.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }
  query = query.gte("attendance_date", filters?.startDate || defaultStart.toISOString().split("T")[0]);
  if (filters?.endDate) {
    query = query.lte("attendance_date", filters.endDate);
  }

  const { data: records, error } = await query;
  if (error) return { error: error.message };

  const stats = (records || []).reduce(
    (acc, r) => ({
      total: acc.total + 1,
      present: acc.present + (r.status === "present" ? 1 : 0),
      absent: acc.absent + (r.status === "absent" ? 1 : 0),
      tardy: acc.tardy + (r.status === "tardy" ? 1 : 0),
      totalHours: acc.totalHours + (r.actual_hours || 0),
    }),
    { total: 0, present: 0, absent: 0, tardy: 0, totalHours: 0 }
  );

  const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return { data: { ...stats, rate } };
}

export async function getFinancialReport(filters?: ReportFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("student_accounts")
    .select("current_balance, total_charges, total_payments, total_aid_applied, student_id");

  // If campus filter, we need to join through students
  if (filters?.campusId) {
    // Get student IDs for this campus first
    const { data: campusStudents } = await supabase
      .from("students")
      .select("id")
      .eq("campus_id", filters.campusId);
    const ids = (campusStudents || []).map((s) => s.id);
    if (ids.length === 0) {
      return { data: { totalCharges: 0, totalPayments: 0, totalAid: 0, totalBalance: 0, count: 0 } };
    }
    query = query.in("student_id", ids);
  }

  const { data: accounts, error } = await query;
  if (error) return { error: error.message };

  const summary = (accounts || []).reduce(
    (acc, a) => ({
      totalCharges: acc.totalCharges + (a.total_charges || 0),
      totalPayments: acc.totalPayments + (a.total_payments || 0),
      totalAid: acc.totalAid + (a.total_aid_applied || 0),
      totalBalance: acc.totalBalance + (a.current_balance || 0),
    }),
    { totalCharges: 0, totalPayments: 0, totalAid: 0, totalBalance: 0 }
  );

  return { data: { ...summary, count: accounts?.length || 0 } };
}

export async function getApplicationsReport(filters?: ReportFilters) {
  const supabase = await createClient();

  let query = supabase.from("applications").select("status, campus_id, submitted_at");

  if (filters?.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }
  if (filters?.startDate) {
    query = query.gte("submitted_at", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("submitted_at", filters.endDate);
  }

  const { data: apps, error } = await query;
  if (error) return { error: error.message };

  const statusCounts: Record<string, number> = {};
  (apps || []).forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  return { data: { total: apps?.length || 0, statusCounts } };
}

export async function getSapReport(filters?: ReportFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("current_sap_status, total_hours_completed, campus_id")
    .in("status", ["active", "enrolled"]);

  if (filters?.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }

  const { data: students, error } = await query;
  if (error) return { error: error.message };

  const sapCounts: Record<string, number> = {};
  let totalHours = 0;
  (students || []).forEach((s) => {
    sapCounts[s.current_sap_status] = (sapCounts[s.current_sap_status] || 0) + 1;
    totalHours += s.total_hours_completed || 0;
  });

  return { data: { total: students?.length || 0, sapCounts, totalHours } };
}

export async function getCompletionReport(filters?: ReportFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("id, status, graduation_date, program_id, program:programs(name)");

  if (filters?.campusId) query = query.eq("campus_id", filters.campusId);
  if (filters?.startDate) query = query.gte("enrollment_date", filters.startDate);
  if (filters?.endDate) query = query.lte("enrollment_date", filters.endDate);

  const { data: students, error } = await query;
  if (error) return { error: error.message };

  const graduated = (students || []).filter((s) => s.status === "graduated");
  const total = students?.length || 0;
  const rate = total > 0 ? Math.round((graduated.length / total) * 100) : 0;

  const byProgram: Record<string, { graduated: number; total: number; rate: number }> = {};
  (students || []).forEach((s) => {
    const program = s.program as { name?: string } | { name?: string }[] | null;
    const programName = Array.isArray(program) ? program[0]?.name : program?.name;
    const key = programName || "Unknown";
    if (!byProgram[key]) byProgram[key] = { graduated: 0, total: 0, rate: 0 };
    byProgram[key]!.total++;
    if (s.status === "graduated") byProgram[key]!.graduated++;
  });

  Object.keys(byProgram).forEach((key) => {
    const prog = byProgram[key]!;
    prog.rate = prog.total > 0 ? Math.round((prog.graduated / prog.total) * 100) : 0;
  });

  return { data: { total, graduated: graduated.length, rate, byProgram } };
}

export async function getRetentionReport(filters?: ReportFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("id, status, enrollment_date");

  if (filters?.campusId) query = query.eq("campus_id", filters.campusId);
  if (filters?.startDate) query = query.gte("enrollment_date", filters.startDate);
  if (filters?.endDate) query = query.lte("enrollment_date", filters.endDate);

  const { data: students, error } = await query;
  if (error) return { error: error.message };

  const retained = (students || []).filter((s) =>
    ["active", "enrolled", "loa", "graduated"].includes(s.status)
  );
  const withdrawn = (students || []).filter((s) =>
    ["withdrawn", "dropped"].includes(s.status)
  );
  const total = students?.length || 0;
  const rate = total > 0 ? Math.round((retained.length / total) * 100) : 0;

  return { data: { total, retained: retained.length, withdrawn: withdrawn.length, rate } };
}

export async function getHoursReport(filters?: ReportFilters) {
  const supabase = await createClient();

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);

  let query = supabase
    .from("attendance_records")
    .select("scheduled_hours, actual_hours, campus_id, attendance_date");

  if (filters?.campusId) query = query.eq("campus_id", filters.campusId);
  query = query.gte("attendance_date", filters?.startDate || defaultStart.toISOString().split("T")[0]);
  if (filters?.endDate) query = query.lte("attendance_date", filters.endDate);

  const { data: records, error } = await query;
  if (error) return { error: error.message };

  const totalScheduled = (records || []).reduce((sum, r) => sum + (r.scheduled_hours || 0), 0);
  const totalActual = (records || []).reduce((sum, r) => sum + (r.actual_hours || 0), 0);
  const variance = totalActual - totalScheduled;
  const rate = totalScheduled > 0 ? Math.round((totalActual / totalScheduled) * 100) : 0;

  return { data: { totalScheduled, totalActual, variance, rate, recordCount: records?.length || 0 } };
}
