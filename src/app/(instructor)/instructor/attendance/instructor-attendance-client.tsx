"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, StopCircle, CheckCircle, Users } from "lucide-react";
import { clockIn, clockOut } from "@/lib/actions/attendance";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  actual_hours: number | null;
  status: string;
  student: any;
}

interface Props {
  campusId: string;
  availableStudents: Student[];
  activeSessions: AttendanceRecord[];
  completedSessions: AttendanceRecord[];
}

export function InstructorAttendanceClient({
  campusId,
  availableStudents,
  activeSessions,
  completedSessions,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleClockIn = (studentId: string) => {
    setActionId(studentId);
    startTransition(async () => {
      const result = await clockIn(studentId, campusId);
      if (result.error) {
        alert(result.error);
      }
      setActionId(null);
      router.refresh();
    });
  };

  const handleClockOut = (recordId: string) => {
    setActionId(recordId);
    startTransition(async () => {
      const result = await clockOut(recordId);
      if (result.error) {
        alert(result.error);
      }
      setActionId(null);
      router.refresh();
    });
  };

  const getStudentName = (record: AttendanceRecord) => {
    const s = record.student as { first_name?: string; last_name?: string; student_number?: string } | { first_name?: string; last_name?: string; student_number?: string }[] | null;
    const student = Array.isArray(s) ? s[0] : s;
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  const getStudentNumber = (record: AttendanceRecord) => {
    const s = record.student as { student_number?: string } | { student_number?: string }[] | null;
    const student = Array.isArray(s) ? s[0] : s;
    return student?.student_number || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Clock students in and out for today</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <PlayCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeSessions.length}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedSessions.length}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-brand-accent/10">
                <Users className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{availableStudents.length}</p>
                <p className="text-sm text-muted-foreground">Not Clocked In</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clock In */}
      {availableStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-green-500" />
              Clock In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{student.student_number}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleClockIn(student.id)}
                    isLoading={isPending && actionId === student.id}
                    disabled={isPending}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Clock In
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-accent" />
              Active Sessions ({activeSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSessions.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-green-500/5"
                >
                  <div>
                    <p className="font-medium text-foreground">{getStudentName(record)}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{getStudentNumber(record)}</span>
                      {" · Clocked in "}
                      {record.clock_in_time
                        ? new Date(record.clock_in_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                        : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleClockOut(record.id)}
                    isLoading={isPending && actionId === record.id}
                    disabled={isPending}
                  >
                    <StopCircle className="w-4 h-4 mr-1" />
                    Clock Out
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Today */}
      {completedSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Completed Today ({completedSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Clock In</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Clock Out</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSessions.map((record) => (
                    <tr key={record.id} className="border-b border-border">
                      <td className="py-2 px-3">
                        <p className="text-sm font-medium">{getStudentName(record)}</p>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
