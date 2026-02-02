"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { getTodayCompletedRecords } from "@/lib/actions/attendance";

interface AttendanceRecord {
  id: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  actual_hours: number | null;
  theory_hours: number;
  practical_hours: number;
  status: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_number: string;
    program: { name: string } | { name: string }[] | null;
  } | null;
}

const statusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  present: { variant: "default", label: "Present" },
  absent: { variant: "destructive", label: "Absent" },
  tardy: { variant: "secondary", label: "Tardy" },
  excused: { variant: "outline", label: "Excused" },
};

interface AttendanceTableProps {
  campusId: string;
}

export function AttendanceTable({ campusId }: AttendanceTableProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    getTodayCompletedRecords(campusId).then((data) => {
      if (!cancelled) setRecords(data as unknown as AttendanceRecord[]);
    });
    return () => { cancelled = true; };
  }, [campusId]);

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="w-5 h-5" />
          Today&apos;s Completed Records ({records.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-center py-6 text-sm text-muted-foreground">
            No completed attendance records today
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Clock In</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Clock Out</th>
                  <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Theory</th>
                  <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Practical</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((record) => {
                  const student = record.student;
                  const program = student?.program
                    ? Array.isArray(student.program)
                      ? student.program[0]?.name
                      : student.program.name
                    : null;
                  const badge = statusBadge[record.status] || { variant: "outline" as const, label: record.status };

                  return (
                    <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="text-sm font-medium text-foreground">
                          {student?.first_name} {student?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student?.student_number}{program && ` · ${program}`}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground">
                        {formatTime(record.clock_in_time)}
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground">
                        {formatTime(record.clock_out_time)}
                      </td>
                      <td className="py-3 px-3 text-right text-sm font-medium text-foreground">
                        {(record.actual_hours || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-muted-foreground">
                        {record.theory_hours.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-muted-foreground">
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
  );
}
