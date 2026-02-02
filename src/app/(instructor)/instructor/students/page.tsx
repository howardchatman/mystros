import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getInstructorStudents } from "@/lib/actions/instructor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Students | Instructor Portal",
  description: "View students at your campus",
};

export default async function InstructorStudentsPage() {
  const user = await getUser();
  if (!user || user.role !== "instructor") redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("campus_id")
    .eq("id", user.id)
    .single();
  const campusId = (profile as any)?.campus_id as string;
  if (!campusId) redirect("/login");

  const students = await getInstructorStudents(campusId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Students</h1>
        <p className="text-muted-foreground">{students.length} active students at your campus</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No active students at your campus.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours Progress</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const program = student.program as { name?: string; total_hours?: number } | { name?: string; total_hours?: number }[] | null;
                    const prog = Array.isArray(program) ? program[0] : program;
                    const totalHours = prog?.total_hours || 0;
                    const completed = student.total_hours_completed || 0;
                    const percent = totalHours > 0 ? Math.round((completed / totalHours) * 100) : 0;

                    return (
                      <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Link
                            href={`/instructor/students/${student.id}`}
                            className="font-medium text-foreground hover:text-brand-accent transition-colors"
                          >
                            {student.first_name} {student.last_name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                          {student.student_number}
                        </td>
                        <td className="py-3 px-4 text-sm">{prog?.name || "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={percent} className="h-2 w-24" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {completed}/{totalHours}h ({percent}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default" className="capitalize">
                            {student.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
