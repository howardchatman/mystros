"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Dashboard Stats ─────────────────────────────────────

export async function getInstructorDashboardStats(campusId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Today's attendance at this campus
  const { data: todayRecords } = await supabase
    .from("attendance_records")
    .select("id, clock_out_time")
    .eq("campus_id", campusId)
    .eq("attendance_date", today);

  const records = todayRecords || [];
  const activeSessions = records.filter((r) => !r.clock_out_time).length;
  const completedToday = records.filter((r) => !!r.clock_out_time).length;

  // Student count at campus
  const { count: studentCount } = await supabase
    .from("students")
    .select("id", { count: "exact" })
    .eq("campus_id", campusId)
    .in("status", ["active", "enrolled"]);

  // Pending competency evaluations
  const { data: students } = await supabase
    .from("students")
    .select("id, program_id")
    .eq("campus_id", campusId)
    .in("status", ["active", "enrolled"]);

  let pendingEvals = 0;
  if (students && students.length > 0) {
    const programIds = [...new Set(students.map((s) => s.program_id).filter(Boolean))];

    const { data: definitions } = await supabase
      .from("competency_definitions")
      .select("id, program_id")
      .in("program_id", programIds)
      .eq("is_active", true);

    const { data: completedComps } = await supabase
      .from("student_competencies")
      .select("student_id, competency_definition_id")
      .in("student_id", students.map((s) => s.id))
      .not("completed_at", "is", null);

    const completedSet = new Set(
      (completedComps || []).map((c) => `${c.student_id}:${c.competency_definition_id}`)
    );

    for (const student of students) {
      const defs = (definitions || []).filter((d) => d.program_id === student.program_id);
      for (const def of defs) {
        if (!completedSet.has(`${student.id}:${def.id}`)) {
          pendingEvals++;
        }
      }
    }
  }

  return {
    activeSessions,
    completedToday,
    studentCount: studentCount || 0,
    pendingEvals,
  };
}

// ─── Students List ───────────────────────────────────────

export async function getInstructorStudents(campusId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      first_name,
      last_name,
      student_number,
      status,
      total_hours_completed,
      program:programs(name, total_hours)
    `)
    .eq("campus_id", campusId)
    .in("status", ["active", "enrolled"])
    .order("last_name");

  if (error) {
    console.error("[getInstructorStudents] error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Student Detail ──────────────────────────────────────

export async function getInstructorStudentDetail(studentId: string, campusId: string) {
  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select(`
      *,
      program:programs(name, total_hours, theory_hours, practical_hours),
      campus:campuses(name)
    `)
    .eq("id", studentId)
    .eq("campus_id", campusId)
    .single();

  if (error || !student) return null;

  // Recent attendance (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("id, attendance_date, clock_in_time, clock_out_time, actual_hours, theory_hours, practical_hours, status")
    .eq("student_id", studentId)
    .gte("attendance_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("attendance_date", { ascending: false });

  // Competency progress
  const { data: definitions } = await supabase
    .from("competency_definitions")
    .select("id, name, category, sort_order")
    .eq("program_id", student.program_id)
    .eq("is_active", true)
    .order("category")
    .order("sort_order");

  const { data: progress } = await supabase
    .from("student_competencies")
    .select("competency_definition_id, completed_at, evaluated_by, notes")
    .eq("student_id", studentId);

  return {
    student,
    attendance: attendance || [],
    competencies: {
      definitions: definitions || [],
      progress: progress || [],
    },
  };
}

// ─── Competencies by Student ─────────────────────────────

export async function getCompetenciesByStudent(campusId: string) {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select(`
      id,
      first_name,
      last_name,
      student_number,
      program_id,
      program:programs(name)
    `)
    .eq("campus_id", campusId)
    .in("status", ["active", "enrolled"])
    .order("last_name");

  if (!students || students.length === 0) return [];

  const studentIds = students.map((s) => s.id);
  const programIds = [...new Set(students.map((s) => s.program_id).filter(Boolean))];

  const { data: definitions } = await supabase
    .from("competency_definitions")
    .select("id, name, category, sort_order, program_id")
    .in("program_id", programIds)
    .eq("is_active", true)
    .order("category")
    .order("sort_order");

  const { data: completed } = await supabase
    .from("student_competencies")
    .select("student_id, competency_definition_id, completed_at")
    .in("student_id", studentIds);

  const completedSet = new Set(
    (completed || []).map((c) => `${c.student_id}:${c.competency_definition_id}`)
  );

  return students.map((student) => {
    const defs = (definitions || []).filter((d) => d.program_id === student.program_id);
    const totalDefs = defs.length;
    const completedCount = defs.filter((d) => completedSet.has(`${student.id}:${d.id}`)).length;
    const pending = defs.filter((d) => !completedSet.has(`${student.id}:${d.id}`));

    return {
      ...student,
      totalCompetencies: totalDefs,
      completedCompetencies: completedCount,
      pendingCompetencies: pending,
    };
  });
}
