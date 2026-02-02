import { createClient } from "@/lib/supabase/server";
import { StudentList } from "./student-list";

export const metadata = {
  title: "Student Records | Auditor",
  description: "Read-only student records for audit review",
};

export default async function AuditorStudentsPage() {
  const supabase = await createClient();

  const [{ data: students }, { data: campuses }, { data: programs }] = await Promise.all([
    supabase
      .from("students")
      .select(`
        id,
        student_number,
        first_name,
        last_name,
        status,
        total_hours_completed,
        current_sap_status,
        program:programs(name),
        campus:campuses(name)
      `)
      .in("status", ["active", "enrolled", "graduated", "loa"])
      .order("last_name"),
    supabase.from("campuses").select("id, name").eq("is_active", true).order("name"),
    supabase.from("programs").select("id, name").eq("is_active", true).order("name"),
  ]);

  const normalizedStudents = (students || []).map((s: any) => ({
    ...s,
    program: Array.isArray(s.program) ? s.program[0] : s.program,
    campus: Array.isArray(s.campus) ? s.campus[0] : s.campus,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Student Records</h1>
        <p className="text-muted-foreground">Read-only student records for audit review</p>
      </div>
      <StudentList
        students={normalizedStudents}
        campuses={(campuses || []).map((c) => ({ id: c.id, name: c.name }))}
        programs={(programs || []).map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
