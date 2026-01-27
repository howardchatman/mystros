import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Scissors, Calendar, TrendingUp, CheckCircle } from "lucide-react";

export const metadata = {
  title: "My Hours | Student Portal",
  description: "Track your clock hours progress",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status: string) {
  const config: Record<string, { color: string; label: string }> = {
    present: { color: "bg-green-500", label: "Present" },
    absent: { color: "bg-red-500", label: "Absent" },
    tardy: { color: "bg-yellow-500", label: "Tardy" },
    excused: { color: "bg-blue-500", label: "Excused" },
  };

  const { color, label } = config[status] || { color: "bg-gray-500", label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-white ${color}`}>
      {label}
    </span>
  );
}

export default async function HoursPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get student with program info
  const { data: student } = await supabase
    .from("students")
    .select(
      `
      *,
      program:programs(*),
      campus:campuses(name)
    `
    )
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Hours</h1>
          <p className="text-muted-foreground">Track your clock hours progress</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Not Yet Enrolled</h3>
              <p className="text-muted-foreground">
                Complete your enrollment to start tracking your hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get recent attendance records
  const { data: recentAttendance } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("student_id", student.id)
    .order("attendance_date", { ascending: false })
    .limit(14);

  const program = student.program as {
    name?: string;
    total_hours?: number;
    theory_hours?: number;
    practical_hours?: number;
  } | null;

  const totalHours = program?.total_hours || 1500;
  const theoryRequired = program?.theory_hours || 500;
  const practicalRequired = program?.practical_hours || 1000;

  const totalProgress = Math.round((student.total_hours_completed / totalHours) * 100);
  const theoryProgress = Math.round((student.theory_hours_completed / theoryRequired) * 100);
  const practicalProgress = Math.round((student.practical_hours_completed / practicalRequired) * 100);

  // Calculate weekly averages
  const thisWeekRecords = (recentAttendance || []).filter((r) => {
    const recordDate = new Date(r.attendance_date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return recordDate >= weekAgo;
  });

  const thisWeekHours = thisWeekRecords.reduce(
    (sum, r) => sum + (r.actual_hours || 0),
    0
  );

  const hoursRemaining = totalHours - student.total_hours_completed;
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Hours</h1>
        <p className="text-muted-foreground">
          {program?.name || "Program"} • {(student.campus as { name?: string })?.name || "Campus"}
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Total Hours Progress
          </CardTitle>
          <CardDescription>
            {student.total_hours_completed.toLocaleString()} of {totalHours.toLocaleString()} hours completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{totalProgress}%</span>
            </div>
            <Progress value={Math.min(totalProgress, 100)} className="h-4" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold text-foreground">
                {hoursRemaining.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Hours Remaining</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold text-foreground">{thisWeekHours}</p>
              <p className="text-sm text-muted-foreground">Hours This Week</p>
            </div>
          </div>
          {totalProgress >= 100 && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Congratulations! You&apos;ve completed all required hours!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theory & Practical Breakdown */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Theory Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {student.theory_hours_completed}
                </p>
                <p className="text-sm text-muted-foreground">of {theoryRequired} hours</p>
              </div>
              <Progress value={Math.min(theoryProgress, 100)} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {theoryProgress}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-purple-500" />
              Practical Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {student.practical_hours_completed}
                </p>
                <p className="text-sm text-muted-foreground">of {practicalRequired} hours</p>
              </div>
              <Progress value={Math.min(practicalProgress, 100)} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {practicalProgress}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Attendance
          </CardTitle>
          <CardDescription>Your attendance for the past 2 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAttendance && recentAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Clock In</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Clock Out</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((record) => (
                    <tr key={record.id} className="border-b border-border">
                      <td className="py-2 px-3">
                        <span className="text-foreground">{formatDate(record.attendance_date)}</span>
                      </td>
                      <td className="py-2 px-3">{getStatusBadge(record.status)}</td>
                      <td className="py-2 px-3 text-sm text-muted-foreground">
                        {record.clock_in_time || "—"}
                      </td>
                      <td className="py-2 px-3 text-sm text-muted-foreground">
                        {record.clock_out_time || "—"}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="font-medium">{record.actual_hours || 0}</span>
                        <span className="text-muted-foreground text-sm"> hrs</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No attendance records yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SAP Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Satisfactory Academic Progress (SAP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                student.current_sap_status === "satisfactory"
                  ? "bg-green-500/20"
                  : student.current_sap_status === "warning"
                  ? "bg-yellow-500/20"
                  : "bg-red-500/20"
              }`}
            >
              {student.current_sap_status === "satisfactory" ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground capitalize">
                {student.current_sap_status.replace("_", " ")}
              </p>
              <p className="text-sm text-muted-foreground">
                {student.last_sap_evaluation_date
                  ? `Last evaluated: ${formatDate(student.last_sap_evaluation_date)}`
                  : "Pending evaluation"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
