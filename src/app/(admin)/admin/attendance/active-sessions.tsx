"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { getActiveAttendanceSessions } from "@/lib/actions/attendance";
import { ClockOutModal } from "./clock-out-modal";

interface Session {
  id: string;
  clock_in_time: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_number: string;
    program: { name: string } | { name: string }[] | null;
  } | null;
}

interface ActiveSessionsProps {
  campusId: string;
  onClockOut: () => void;
}

function ElapsedTime({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function update() {
      const ms = Date.now() - new Date(since).getTime();
      const hours = Math.floor(ms / 3_600_000);
      const minutes = Math.floor((ms % 3_600_000) / 60_000);
      setElapsed(`${hours}h ${minutes}m`);
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [since]);

  return <span className="font-mono text-sm text-foreground">{elapsed}</span>;
}

export function ActiveSessions({ campusId, onClockOut }: ActiveSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clockOutRecord, setClockOutRecord] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveAttendanceSessions(campusId).then((data) => {
      if (!cancelled) setSessions(data as unknown as Session[]);
    });
    return () => { cancelled = true; };
  }, [campusId]);

  const handleClockOutComplete = () => {
    setClockOutRecord(null);
    // Refresh sessions
    getActiveAttendanceSessions(campusId).then((data) => {
      setSessions(data as unknown as Session[]);
    });
    onClockOut();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-green-500" />
            Active Sessions ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No students currently clocked in
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const student = session.student;
                const program = student?.program
                  ? Array.isArray(student.program)
                    ? student.program[0]?.name
                    : student.program.name
                  : null;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {student?.first_name} {student?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student?.student_number}
                          {program && ` · ${program}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <ElapsedTime since={session.clock_in_time} />
                        <p className="text-xs text-muted-foreground">
                          In: {new Date(session.clock_in_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setClockOutRecord(session)}
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Clock Out
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {clockOutRecord && (
        <ClockOutModal
          record={clockOutRecord}
          onClose={() => setClockOutRecord(null)}
          onComplete={handleClockOutComplete}
        />
      )}
    </>
  );
}
