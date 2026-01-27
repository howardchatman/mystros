"use server";

import { createClient } from "@/lib/supabase/server";

export interface StudentDashboardData {
  student: any | null;
  recentAttendance: any[];
  financialAccount: any | null;
  financialAid: any | null;
  documents: any[];
  program: any | null;
}

/**
 * Get all dashboard data for a student
 */
export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      student: null,
      recentAttendance: [],
      financialAccount: null,
      financialAid: null,
      documents: [],
      program: null,
    };
  }

  // Get student record
  const { data: student } = await supabase
    .from("students")
    .select(
      `
      *,
      campus:campuses(name, code),
      program:programs(name, code, total_hours, theory_hours, practical_hours)
    `
    )
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return {
      student: null,
      recentAttendance: [],
      financialAccount: null,
      financialAid: null,
      documents: [],
      program: null,
    };
  }

  // Get recent attendance (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentAttendance } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("student_id", student.id)
    .gte("attendance_date", sevenDaysAgo.toISOString().split("T")[0])
    .order("attendance_date", { ascending: false });

  // Get financial account
  const { data: financialAccount } = await supabase
    .from("student_accounts")
    .select("*")
    .eq("student_id", student.id)
    .single();

  // Get financial aid record with awards
  const { data: financialAid } = await supabase
    .from("financial_aid_records")
    .select(
      `
      *,
      awards:financial_aid_awards(*)
    `
    )
    .eq("student_id", student.id)
    .order("academic_year", { ascending: false })
    .limit(1)
    .single();

  // Get documents
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  return {
    student,
    recentAttendance: recentAttendance || [],
    financialAccount,
    financialAid,
    documents: documents || [],
    program: student.program,
  };
}

/**
 * Get student hours progress
 */
export async function getStudentHoursProgress() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select(
      `
      total_hours_completed,
      theory_hours_completed,
      practical_hours_completed,
      program:programs(total_hours, theory_hours, practical_hours)
    `
    )
    .eq("user_id", user.id)
    .single();

  return student;
}
