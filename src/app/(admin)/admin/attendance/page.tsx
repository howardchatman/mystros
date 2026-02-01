import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";

export const metadata = {
  title: "Attendance | Admin Dashboard",
  description: "Manage student attendance records",
};

function getStatusBadge(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    present: { variant: "default", label: "Present" },
    absent: { variant: "destructive", label: "Absent" },
    tardy: { variant: "secondary", label: "Tardy" },
    excused: { variant: "outline", label: "Excused" },
  };
  const { variant, label } = config[status] || { variant: "outline" as const, label: status };
  return <Badge variant={variant} className="capitalize">{label}</Badge>;
}

export default async function AttendancePage() {
  const supabase = await createClient();

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Get today's attendance records with student info
  const { data: todayRecords } = await supabase
    .from("attendance_records")
    .select(`
      *,
      student:students(
        id,
        first_name,
        last_name,
        student_number,
        program:programs(name)
      )
    `)
    .eq("attendance_date", today)
    .order("created_at", { ascending: false });

  // Get recent attendance records (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: recentRecords } = await supabase
    .from("attendance_records")
    .select(`
      *,
      student:students(
        id,
        first_name,
        last_name,
        student_number
      )
    `)
    .gte("attendance_date", weekAgo.toISOString().split("T")[0])
    .order("attendance_date", { ascending: false })
    .limit(50);

  const records = todayRecords || [];
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const tardy = records.filter((r) => r.status === "tardy").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">
          Manage and track daily student attendance
        </p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-brand-accent/10">
                <Users className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{records.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{present}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{absent}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{tardy}</p>
                <p className="text-sm text-muted-foreground">Tardy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today&apos;s Attendance — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Attendance Records</h3>
              <p className="text-muted-foreground">No attendance has been recorded for today yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clock In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clock Out</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const student = record.student as { first_name?: string; last_name?: string; student_number?: string; program?: { name?: string } | { name?: string }[] } | null;
                    const program = student?.program;
                    const programName = Array.isArray(program) ? program[0]?.name : program?.name;
                    return (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{programName || ""}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{student?.student_number || "—"}</span>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{record.clock_in_time || "—"}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{record.clock_out_time || "—"}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium">{record.actual_hours || 0}</span>
                          <span className="text-muted-foreground text-sm"> hrs</span>
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

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentRecords || recentRecords.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No recent records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record) => {
                    const student = record.student as { first_name?: string; last_name?: string; student_number?: string } | null;
                    return (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(record.attendance_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-foreground">
                            {student?.first_name} {student?.last_name}
                          </p>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                        <td className="py-3 px-4 text-right text-sm">
                          {record.actual_hours || 0} hrs
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
