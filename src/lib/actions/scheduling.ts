"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Calendar Events ────────────────────────────────────────────

export async function getCalendarEvents(
  month: number,
  year: number,
  campusId?: string
) {
  const supabase = await createClient();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  let query = supabase
    .from("calendar_events")
    .select("*")
    .gte("start_date", startDate)
    .lt("start_date", endDate)
    .order("start_date");

  if (campusId) {
    query = query.or(`campus_id.eq.${campusId},campus_id.is.null`);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function createCalendarEvent(data: {
  title: string;
  event_type: string;
  campus_id?: string | null;
  start_date: string;
  end_date?: string | null;
  all_day?: boolean;
  start_time?: string | null;
  end_time?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("calendar_events")
    .insert({
      ...data,
      created_by: user?.id || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/scheduling");
  return { data: event };
}

export async function updateCalendarEvent(
  id: string,
  updates: {
    title?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string | null;
    all_day?: boolean;
    start_time?: string | null;
    end_time?: string | null;
  }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/scheduling");
  return { data };
}

export async function deleteCalendarEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/scheduling");
  return { success: true };
}

// ─── Program Schedules ──────────────────────────────────────────

export async function getProgramSchedules(programId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("program_schedules")
    .select(`
      *,
      program:programs(name),
      campus:campuses(name)
    `)
    .order("program_id");

  if (programId) {
    query = query.eq("program_id", programId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data || [] };
}

// ─── Student Schedule ───────────────────────────────────────────

export async function getStudentSchedule(studentId: string) {
  const supabase = await createClient();

  // Get student's program + campus
  const { data: student } = await supabase
    .from("students")
    .select("program_id, campus_id")
    .eq("id", studentId)
    .single();

  if (!student) return { schedule: null, events: [] };

  // Get their program schedule
  const { data: schedules } = await supabase
    .from("program_schedules")
    .select("*")
    .eq("program_id", student.program_id)
    .eq("campus_id", student.campus_id);

  // Get upcoming calendar events
  const today = new Date().toISOString().split("T")[0]!;
  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("start_date", today)
    .or(`campus_id.eq.${student.campus_id},campus_id.is.null`)
    .order("start_date")
    .limit(10);

  return {
    schedule: schedules?.[0] || null,
    events: events || [],
  };
}

export async function getStudentAttendanceForMonth(
  studentId: string,
  month: number,
  year: number
) {
  const supabase = await createClient();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("attendance_records")
    .select("attendance_date, status, actual_hours")
    .eq("student_id", studentId)
    .gte("attendance_date", startDate)
    .lt("attendance_date", endDate);

  return data || [];
}
