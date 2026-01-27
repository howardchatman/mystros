"use server";

import { createClient } from "@/lib/supabase/server";

export interface AdminDashboardKPIs {
  totalActiveStudents: number;
  todayAttendanceRate: number;
  pendingApplications: number;
  totalOutstandingBalance: number;
}

/**
 * Get admin dashboard KPIs
 */
export async function getAdminDashboardKPIs(
  campusId?: string
): Promise<AdminDashboardKPIs> {
  const supabase = await createClient();

  // Get total active students
  let studentsQuery = supabase
    .from("students")
    .select("id", { count: "exact" })
    .eq("status", "active");

  if (campusId) {
    studentsQuery = studentsQuery.eq("campus_id", campusId);
  }

  const { count: totalActiveStudents } = await studentsQuery;

  // Get today's attendance rate
  const today = new Date().toISOString().split("T")[0];
  let attendanceQuery = supabase
    .from("attendance_records")
    .select("status")
    .eq("attendance_date", today);

  if (campusId) {
    attendanceQuery = attendanceQuery.eq("campus_id", campusId);
  }

  const { data: attendanceRecords } = await attendanceQuery;

  const presentCount = attendanceRecords?.filter(
    (r) => r.status === "present"
  ).length || 0;
  const totalAttendance = attendanceRecords?.length || 0;
  const todayAttendanceRate =
    totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

  // Get pending applications
  let applicationsQuery = supabase
    .from("applications")
    .select("id", { count: "exact" })
    .eq("status", "applicant")
    .not("submitted_at", "is", null);

  if (campusId) {
    applicationsQuery = applicationsQuery.eq("campus_id", campusId);
  }

  const { count: pendingApplications } = await applicationsQuery;

  // Get total outstanding balance
  let accountsQuery = supabase
    .from("student_accounts")
    .select("current_balance");

  // Note: We'd need to join with students to filter by campus
  // For now, getting all accounts
  const { data: accounts } = await accountsQuery;

  const totalOutstandingBalance =
    accounts?.reduce((sum, acc) => sum + (acc.current_balance > 0 ? acc.current_balance : 0), 0) || 0;

  return {
    totalActiveStudents: totalActiveStudents || 0,
    todayAttendanceRate,
    pendingApplications: pendingApplications || 0,
    totalOutstandingBalance,
  };
}

/**
 * Get student roster for admin
 */
export async function getStudentRoster(
  campusId?: string,
  limit = 10,
  offset = 0
) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select(
      `
      id,
      student_number,
      first_name,
      last_name,
      email,
      status,
      total_hours_completed,
      campus:campuses(name),
      program:programs(name, total_hours)
    `,
      { count: "exact" }
    )
    .order("last_name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (campusId) {
    query = query.eq("campus_id", campusId);
  }

  const { data, count, error } = await query;

  if (error) {
    return { students: [], total: 0, error: error.message };
  }

  return { students: data || [], total: count || 0 };
}

/**
 * Get pending applications
 */
export async function getPendingApplications(campusId?: string, limit = 5) {
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      phone,
      submitted_at,
      campus:campuses(name),
      program:programs(name)
    `
    )
    .eq("status", "applicant")
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: true })
    .limit(limit);

  if (campusId) {
    query = query.eq("campus_id", campusId);
  }

  const { data, error } = await query;

  if (error) {
    return { applications: [], error: error.message };
  }

  return { applications: data || [] };
}

/**
 * Get today's attendance summary
 */
export async function getTodayAttendanceSummary(campusId?: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("attendance_records")
    .select(
      `
      id,
      status,
      student:students(first_name, last_name, student_number)
    `
    )
    .eq("attendance_date", today);

  if (campusId) {
    query = query.eq("campus_id", campusId);
  }

  const { data, error } = await query;

  if (error) {
    return {
      present: 0,
      absent: 0,
      tardy: 0,
      records: [],
      error: error.message,
    };
  }

  const records = data || [];
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const tardy = records.filter((r) => r.status === "tardy").length;

  return { present, absent, tardy, records };
}
