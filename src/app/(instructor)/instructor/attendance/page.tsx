import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { InstructorAttendanceClient } from "./instructor-attendance-client";

export const metadata = {
  title: "Attendance | Instructor Portal",
  description: "Manage student attendance",
};

export default async function InstructorAttendancePage() {
  const user = await getUser();
  if (!user || user.role !== "instructor") redirect("/login");

  const supabase = await createClient();
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("campus_id")
    .eq("id", user.id)
    .single();
  const campusId = (userProfile as any)?.campus_id as string;
  if (!campusId) redirect("/login");
  const today = new Date().toISOString().split("T")[0];

  // Get attendable students (active/enrolled at this campus, not yet clocked in today)
  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_number")
    .eq("campus_id", campusId)
    .in("status", ["active", "enrolled"])
    .order("last_name");

  // Get today's records at this campus
  const { data: todayRecords } = await supabase
    .from("attendance_records")
    .select("id, student_id, clock_in_time, clock_out_time, actual_hours, status, student:students(first_name, last_name, student_number)")
    .eq("campus_id", campusId)
    .eq("attendance_date", today)
    .order("clock_in_time", { ascending: false });

  const records = todayRecords || [];
  const activeSessions = records.filter((r) => !r.clock_out_time);
  const completedSessions = records.filter((r) => !!r.clock_out_time);

  // Students not yet clocked in
  const clockedInIds = new Set(records.map((r) => r.student_id));
  const availableStudents = (students || []).filter((s) => !clockedInIds.has(s.id));

  return (
    <InstructorAttendanceClient
      campusId={campusId}
      availableStudents={availableStudents}
      activeSessions={activeSessions}
      completedSessions={completedSessions}
    />
  );
}
