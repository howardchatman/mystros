"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";

// ─── Helpers ───────────────────────────────────────────────

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function toDecimalHours(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round((ms / 3_600_000) * 100) / 100; // 2 decimal places
}

// ─── Clock In ──────────────────────────────────────────────

export async function clockIn(studentId: string, campusId: string) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  // Check for existing record today
  const { data: existing } = await supabase
    .from("attendance_records")
    .select("id")
    .eq("student_id", studentId)
    .eq("attendance_date", today)
    .eq("is_correction", false)
    .maybeSingle();

  if (existing) {
    return { error: "Student already has an attendance record for today" };
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      student_id: studentId,
      campus_id: campusId,
      attendance_date: today,
      clock_in_time: now,
      status: "present",
      recorded_by: userId,
      theory_hours: 0,
      practical_hours: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("[clockIn] error:", error.message);
    return { error: error.message };
  }

  logAudit({
    table_name: "attendance_records",
    record_id: data.id,
    action: "create",
    new_data: { student_id: studentId, campus_id: campusId, date: today },
  }).catch(() => {});

  revalidatePath("/admin/attendance");
  return { data };
}

// ─── Bulk Clock In ─────────────────────────────────────────

export async function bulkClockIn(studentIds: string[], campusId: string) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Get students already clocked in today
  const { data: existing } = await supabase
    .from("attendance_records")
    .select("student_id")
    .in("student_id", studentIds)
    .eq("attendance_date", today)
    .eq("is_correction", false);

  const alreadyIn = new Set((existing || []).map((r) => r.student_id));
  const toInsert = studentIds.filter((id) => !alreadyIn.has(id));

  if (toInsert.length === 0) {
    return { error: "All selected students are already clocked in", inserted: 0, skipped: studentIds.length };
  }

  const rows = toInsert.map((student_id) => ({
    student_id,
    campus_id: campusId,
    attendance_date: today,
    clock_in_time: now,
    status: "present" as const,
    recorded_by: userId,
    theory_hours: 0,
    practical_hours: 0,
  }));

  const { error } = await supabase.from("attendance_records").insert(rows);

  if (error) {
    console.error("[bulkClockIn] error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/admin/attendance");
  return { inserted: toInsert.length, skipped: alreadyIn.size };
}

// ─── Clock Out ─────────────────────────────────────────────

export async function clockOut(
  recordId: string,
  theorySplitPercent?: number // 0-100, override for theory % of total hours
) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  // Get the attendance record + student + program
  const { data: record, error: fetchError } = await supabase
    .from("attendance_records")
    .select(`
      *,
      student:students(
        id,
        total_hours_completed,
        theory_hours_completed,
        practical_hours_completed,
        program:programs(total_hours, theory_hours, practical_hours)
      )
    `)
    .eq("id", recordId)
    .single();

  if (fetchError || !record) {
    return { error: fetchError?.message || "Record not found" };
  }

  if (record.clock_out_time) {
    return { error: "Student is already clocked out" };
  }

  if (!record.clock_in_time) {
    return { error: "No clock-in time recorded" };
  }

  const now = new Date().toISOString();
  const actualHours = toDecimalHours(record.clock_in_time, now);

  // Calculate theory/practical split
  const student = record.student as {
    id: string;
    total_hours_completed: number;
    theory_hours_completed: number;
    practical_hours_completed: number;
    program: { total_hours: number; theory_hours: number; practical_hours: number } | { total_hours: number; theory_hours: number; practical_hours: number }[] | null;
  } | null;

  const program = student?.program
    ? Array.isArray(student.program)
      ? student.program[0]
      : student.program
    : null;

  let theoryPercent: number;
  if (theorySplitPercent !== undefined) {
    theoryPercent = theorySplitPercent / 100;
  } else if (program && program.total_hours > 0) {
    theoryPercent = program.theory_hours / program.total_hours;
  } else {
    theoryPercent = 0.3; // default 30% theory
  }

  const theoryHours = Math.round(actualHours * theoryPercent * 100) / 100;
  const practicalHours = Math.round((actualHours - theoryHours) * 100) / 100;

  // Update attendance record
  const { error: updateError } = await supabase
    .from("attendance_records")
    .update({
      clock_out_time: now,
      actual_hours: actualHours,
      theory_hours: theoryHours,
      practical_hours: practicalHours,
      approved_by: userId,
      approved_at: now,
    })
    .eq("id", recordId);

  if (updateError) {
    console.error("[clockOut] update error:", updateError.message);
    return { error: updateError.message };
  }

  // Update student running totals
  if (student) {
    const { error: studentError } = await supabase
      .from("students")
      .update({
        total_hours_completed: (student.total_hours_completed || 0) + actualHours,
        theory_hours_completed: (student.theory_hours_completed || 0) + theoryHours,
        practical_hours_completed: (student.practical_hours_completed || 0) + practicalHours,
      })
      .eq("id", student.id);

    if (studentError) {
      console.error("[clockOut] student update error:", studentError.message);
    }

    // Check for hour milestones
    await checkHourMilestones(
      student.id,
      (student.total_hours_completed || 0) + actualHours,
      userId
    );
  }

  logAudit({
    table_name: "attendance_records",
    record_id: recordId,
    action: "update",
    new_data: { actual_hours: actualHours, theory_hours: theoryHours, practical_hours: practicalHours },
  }).catch(() => {});

  revalidatePath("/admin/attendance");
  return { data: { actualHours, theoryHours, practicalHours } };
}

// ─── Hour Milestones ───────────────────────────────────────

async function checkHourMilestones(
  studentId: string,
  totalHours: number,
  recordedBy: string
) {
  const milestones = [100, 250, 500, 750, 1000];
  const supabase = await createClient();

  for (const threshold of milestones) {
    if (totalHours >= threshold) {
      const type = `hours_${threshold}`;
      // Upsert — only inserts if not already recorded
      await supabase
        .from("student_milestones")
        .upsert(
          {
            student_id: studentId,
            milestone_type: type,
            milestone_name: `${threshold} Hours Completed`,
            recorded_by: recordedBy,
          },
          { onConflict: "student_id,milestone_type" }
        );
    }
  }
}

// ─── Bulk Mark Absent ─────────────────────────────────────

export async function bulkMarkAbsent(
  studentIds: string[],
  campusId: string,
  date?: string
) {
  if (studentIds.length === 0) return { error: "No students selected" };

  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const attendanceDate = date || new Date().toISOString().split("T")[0];

  const records = studentIds.map((studentId) => ({
    student_id: studentId,
    campus_id: campusId,
    attendance_date: attendanceDate,
    status: "absent" as const,
    actual_hours: 0,
    theory_hours: 0,
    practical_hours: 0,
    is_correction: false,
    recorded_by: userId,
  }));

  const { error } = await supabase.from("attendance_records").insert(records);
  if (error) return { error: error.message };

  for (const id of studentIds) {
    logAudit({
      table_name: "attendance_records",
      record_id: id,
      action: "create",
      new_data: { student_id: id, status: "absent", date: attendanceDate },
    }).catch(() => {});
  }

  revalidatePath("/admin/attendance");
  return { success: true, count: studentIds.length };
}

// ─── Get Active Sessions ───────────────────────────────────

export async function getActiveAttendanceSessions(campusId?: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("attendance_records")
    .select(`
      id,
      clock_in_time,
      student:students(
        id,
        first_name,
        last_name,
        student_number,
        program:programs(name)
      )
    `)
    .eq("attendance_date", today)
    .is("clock_out_time", null)
    .eq("is_correction", false)
    .order("clock_in_time", { ascending: true });

  if (campusId) {
    query = query.eq("campus_id", campusId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getActiveSessions] error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Get Attendable Students ───────────────────────────────

export async function getAttendableStudents(campusId?: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get students already clocked in today
  const { data: todayRecords } = await supabase
    .from("attendance_records")
    .select("student_id")
    .eq("attendance_date", today)
    .eq("is_correction", false);

  const clockedInIds = (todayRecords || []).map((r) => r.student_id);

  // Get active/enrolled students
  let query = supabase
    .from("students")
    .select("id, first_name, last_name, student_number, campus_id, program:programs(name)")
    .in("status", ["active", "enrolled"])
    .order("last_name");

  if (campusId) {
    query = query.eq("campus_id", campusId);
  }

  const { data: students, error } = await query;

  if (error) {
    console.error("[getAttendableStudents] error:", error.message);
    return [];
  }

  // Filter out already clocked-in students
  return (students || []).filter((s) => !clockedInIds.includes(s.id));
}

// ─── Attendance Corrections ────────────────────────────────

export async function requestAttendanceCorrection(data: {
  studentId: string;
  campusId: string;
  attendanceDate: string;
  clockInTime: string;
  clockOutTime: string;
  reason: string;
}) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const actualHours = toDecimalHours(data.clockInTime, data.clockOutTime);
  if (actualHours <= 0) {
    return { error: "Clock-out time must be after clock-in time" };
  }

  const { error } = await supabase.from("attendance_records").insert({
    student_id: data.studentId,
    campus_id: data.campusId,
    attendance_date: data.attendanceDate,
    clock_in_time: data.clockInTime,
    clock_out_time: data.clockOutTime,
    actual_hours: actualHours,
    theory_hours: 0,
    practical_hours: 0,
    status: "pending_approval",
    is_correction: true,
    correction_reason: data.reason,
    recorded_by: userId,
  });

  if (error) {
    console.error("[requestCorrection] error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/admin/attendance");
  return { success: true };
}

export async function approveAttendanceCorrection(
  recordId: string,
  approved: boolean,
  notes?: string
) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  if (!approved) {
    // Deny — just delete the pending record
    const { error } = await supabase
      .from("attendance_records")
      .delete()
      .eq("id", recordId)
      .eq("status", "pending_approval");

    if (error) return { error: error.message };
    revalidatePath("/admin/attendance");
    return { success: true };
  }

  // Approve — get record, calculate split, update student totals
  const { data: record, error: fetchError } = await supabase
    .from("attendance_records")
    .select(`
      *,
      student:students(
        id,
        total_hours_completed,
        theory_hours_completed,
        practical_hours_completed,
        program:programs(total_hours, theory_hours, practical_hours)
      )
    `)
    .eq("id", recordId)
    .single();

  if (fetchError || !record) {
    return { error: fetchError?.message || "Record not found" };
  }

  const student = record.student as {
    id: string;
    total_hours_completed: number;
    theory_hours_completed: number;
    practical_hours_completed: number;
    program: { total_hours: number; theory_hours: number; practical_hours: number } | { total_hours: number; theory_hours: number; practical_hours: number }[] | null;
  } | null;

  const program = student?.program
    ? Array.isArray(student.program)
      ? student.program[0]
      : student.program
    : null;

  const theoryPercent =
    program && program.total_hours > 0
      ? program.theory_hours / program.total_hours
      : 0.3;

  const actualHours = record.actual_hours || 0;
  const theoryHours = Math.round(actualHours * theoryPercent * 100) / 100;
  const practicalHours = Math.round((actualHours - theoryHours) * 100) / 100;

  // Update the record
  const { error: updateError } = await supabase
    .from("attendance_records")
    .update({
      status: "present",
      theory_hours: theoryHours,
      practical_hours: practicalHours,
      approved_by: userId,
      approved_at: new Date().toISOString(),
      correction_reason: notes
        ? `${record.correction_reason} | Approved: ${notes}`
        : record.correction_reason,
    })
    .eq("id", recordId);

  if (updateError) return { error: updateError.message };

  logAudit({
    table_name: "attendance_records",
    record_id: recordId,
    action: "update",
    old_data: { status: "pending_approval" },
    new_data: { status: "present", approved: true, actual_hours: actualHours },
  }).catch(() => {});

  // Update student totals
  if (student) {
    await supabase
      .from("students")
      .update({
        total_hours_completed: (student.total_hours_completed || 0) + actualHours,
        theory_hours_completed: (student.theory_hours_completed || 0) + theoryHours,
        practical_hours_completed: (student.practical_hours_completed || 0) + practicalHours,
      })
      .eq("id", student.id);
  }

  revalidatePath("/admin/attendance");
  return { success: true };
}

// ─── Get Pending Corrections ───────────────────────────────

export async function getPendingCorrections() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attendance_records")
    .select(`
      id,
      attendance_date,
      clock_in_time,
      clock_out_time,
      actual_hours,
      correction_reason,
      created_at,
      student:students(id, first_name, last_name, student_number)
    `)
    .eq("status", "pending_approval")
    .eq("is_correction", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPendingCorrections] error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Get Today's Completed Records ─────────────────────────

export async function getTodayCompletedRecords(campusId?: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("attendance_records")
    .select(`
      id,
      clock_in_time,
      clock_out_time,
      actual_hours,
      theory_hours,
      practical_hours,
      status,
      student:students(id, first_name, last_name, student_number, program:programs(name))
    `)
    .eq("attendance_date", today)
    .not("clock_out_time", "is", null)
    .eq("is_correction", false)
    .order("clock_out_time", { ascending: false });

  if (campusId) {
    query = query.eq("campus_id", campusId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getTodayCompleted] error:", error.message);
    return [];
  }

  return data || [];
}
