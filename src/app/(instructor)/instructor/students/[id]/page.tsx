import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getInstructorStudentDetail } from "@/lib/actions/instructor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Clock, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Student Detail | Instructor Portal",
  description: "View student details",
};

export default async function InstructorStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const data = await getInstructorStudentDetail(id, campusId);
  if (!data) notFound();

  const { student, attendance, competencies } = data;
  const program = student.program as { name?: string; total_hours?: number; theory_hours?: number; practical_hours?: number } | null;
  const campus = student.campus as { name?: string } | null;

  const totalHours = program?.total_hours || 0;
  const completed = student.total_hours_completed || 0;
  const percent = totalHours > 0 ? Math.round((completed / totalHours) * 100) : 0;

  const completedSet = new Set(
    competencies.progress
      .filter((p) => p.completed_at)
      .map((p) => p.competency_definition_id)
  );
  const totalComps = competencies.definitions.length;
  const completedComps = competencies.definitions.filter((d) => completedSet.has(d.id)).length;
  const compPercent = totalComps > 0 ? Math.round((completedComps / totalComps) * 100) : 0;

  // Group competencies by category
  const categories = new Map<string, typeof competencies.definitions>();
  for (const def of competencies.definitions) {
    const cat = def.category || "General";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(def);
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/instructor/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center">
          <span className="text-xl font-bold text-brand-accent">
            {student.first_name?.[0]}{student.last_name?.[0]}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {student.first_name} {student.last_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-muted-foreground">{student.student_number}</span>
            <Badge variant="default" className="capitalize">{student.status}</Badge>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Program</p>
            <p className="font-medium text-foreground">{program?.name || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Campus</p>
            <p className="font-medium text-foreground">{campus?.name || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Enrollment Date</p>
            <p className="font-medium text-foreground">
              {student.enrollment_date
                ? new Date(student.enrollment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hours Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Hours Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Hours</span>
                <span className="font-medium">{completed} / {totalHours}h ({percent}%)</span>
              </div>
              <Progress value={percent} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Theory</p>
                <p className="text-lg font-bold">{student.theory_hours_completed || 0}h</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Practical</p>
                <p className="text-lg font-bold">{student.practical_hours_completed || 0}h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No attendance records in the last 30 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Clock In</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Clock Out</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 15).map((record) => (
                    <tr key={record.id} className="border-b border-border">
                      <td className="py-2 px-3 text-sm">
                        {new Date(record.attendance_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {record.clock_in_time
                          ? new Date(record.clock_in_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {record.clock_out_time
                          ? new Date(record.clock_out_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium">
                        {record.actual_hours ? `${record.actual_hours}h` : "—"}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={record.status === "present" ? "default" : "outline"} className="capitalize text-xs">
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competency Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Competency Progress ({completedComps}/{totalComps})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={compPercent} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{compPercent}% complete</p>
          </div>
          {Array.from(categories.entries()).map(([category, defs]) => (
            <div key={category} className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 capitalize">{category}</h3>
              <div className="space-y-1">
                {defs.map((def) => {
                  const isComplete = completedSet.has(def.id);
                  return (
                    <div
                      key={def.id}
                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                        isComplete ? "bg-green-500/10 text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isComplete ? "border-green-500 bg-green-500" : "border-muted-foreground"
                      }`}>
                        {isComplete && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {def.name}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
