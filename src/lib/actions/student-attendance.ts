"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { clockIn, clockOut } from "@/lib/actions/attendance";

async function getMyStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, campus_id, status")
    .eq("user_id", user.id)
    .single();

  return student;
}

export async function studentClockIn() {
  const student = await getMyStudent();
  if (!student) return { error: "Student record not found" };

  if (!["active", "enrolled"].includes(student.status)) {
    return { error: "Only active or enrolled students can clock in" };
  }

  const result = await clockIn(student.id, student.campus_id);

  revalidatePath("/hours");
  return result;
}

export async function studentClockOut() {
  const student = await getMyStudent();
  if (!student) return { error: "Student record not found" };

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: record } = await supabase
    .from("attendance_records")
    .select("id")
    .eq("student_id", student.id)
    .eq("attendance_date", today)
    .is("clock_out_time", null)
    .eq("is_correction", false)
    .maybeSingle();

  if (!record) return { error: "No active clock-in found for today" };

  const result = await clockOut(record.id);

  revalidatePath("/hours");
  return result;
}

export async function getMyClockStatus() {
  const student = await getMyStudent();
  if (!student) return null;

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: record } = await supabase
    .from("attendance_records")
    .select("id, clock_in_time, clock_out_time, actual_hours")
    .eq("student_id", student.id)
    .eq("attendance_date", today)
    .eq("is_correction", false)
    .maybeSingle();

  return record;
}
