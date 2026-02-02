"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Wrench } from "lucide-react";

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  status: string;
  actual_hours: number | null;
  theory_hours: number;
  practical_hours: number;
}

interface StudentAttendanceSectionProps {
  attendance: AttendanceRecord[];
  totalHours: number;
  theoryHours: number;
  practicalHours: number;
  programTotalHours: number;
}

const statusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  present: { variant: "default", label: "Present" },
  absent: { variant: "destructive", label: "Absent" },
  tardy: { variant: "secondary", label: "Tardy" },
  excused: { variant: "outline", label: "Excused" },
};

export function StudentAttendanceSection({
  attendance,
  totalHours,
  theoryHours,
  practicalHours,
  programTotalHours,
}: StudentAttendanceSectionProps) {
  const progress = programTotalHours > 0 ? (totalHours / programTotalHours) * 100 : 0;
  const sorted = [...attendance].sort(
    (a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime()
  );

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const attendanceRate =
    attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Total Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground">{progress.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground">{attendanceRate}%</p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground">{attendance.length}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Hour breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hour Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> Overall
                </span>
                <span className="text-foreground">{totalHours.toFixed(1)} / {programTotalHours}</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5" /> Theory
                </span>
                <span className="text-foreground">{theoryHours.toFixed(1)}</span>
              </div>
              <Progress value={programTotalHours > 0 ? (theoryHours / programTotalHours) * 100 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Wrench className="w-3.5 h-3.5" /> Practical
                </span>
                <span className="text-foreground">{practicalHours.toFixed(1)}</span>
              </div>
              <Progress value={programTotalHours > 0 ? (practicalHours / programTotalHours) * 100 : 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No attendance records yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Hours</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Theory</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Practical</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sorted.map((record) => {
                    const badge = statusBadge[record.status] || {
                      variant: "outline" as const,
                      label: record.status,
                    };
                    return (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="py-2.5 px-3 text-sm text-foreground">
                          {new Date(record.attendance_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm font-medium text-foreground">
                          {(record.actual_hours || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm text-muted-foreground">
                          {record.theory_hours.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm text-muted-foreground">
                          {record.practical_hours.toFixed(2)}
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
