"use client";

import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { format, parseISO } from "date-fns";

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  status: string;
  actual_hours: number;
  clock_in_time: string | null;
  clock_out_time: string | null;
}

interface AttendanceSummaryCardProps {
  attendance: AttendanceRecord[];
}

const statusConfig = {
  present: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  absent: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  tardy: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  excused: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  pending_approval: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
};

export function AttendanceSummaryCard({ attendance }: AttendanceSummaryCardProps) {
  const presentDays = attendance.filter((a) => a.status === "present").length;
  const totalDays = attendance.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Attendance</CardTitle>
        <Calendar className="h-5 w-5 text-brand-accent" />
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-brand-text">{presentDays}</p>
            <p className="text-xs text-brand-muted">Days Present</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-brand-text">{totalDays}</p>
            <p className="text-xs text-brand-muted">Last 7 Days</p>
          </div>
        </div>

        {/* Recent records */}
        {attendance.length > 0 ? (
          <div className="space-y-2">
            {attendance.slice(0, 5).map((record) => {
              const config = statusConfig[record.status as keyof typeof statusConfig] || statusConfig.present;
              const Icon = config.icon;

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-brand-bg/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-full", config.bg)}>
                      <Icon className={cn("w-4 h-4", config.color)} />
                    </div>
                    <div>
                      <p className="text-sm text-brand-text">
                        {format(parseISO(record.attendance_date), "EEE, MMM d")}
                      </p>
                      {record.clock_in_time && record.clock_out_time && (
                        <p className="text-xs text-brand-muted">
                          {format(parseISO(record.clock_in_time), "h:mm a")} -{" "}
                          {format(parseISO(record.clock_out_time), "h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-brand-muted">
                    {record.actual_hours.toFixed(1)} hrs
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-brand-muted text-center py-4">
            No attendance records this week
          </p>
        )}
      </CardContent>
    </Card>
  );
}
