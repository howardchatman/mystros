"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getStudentAttendanceForMonth } from "@/lib/actions/scheduling";

interface AttendanceDay {
  attendance_date: string;
  status: string;
  actual_hours: number | null;
}

interface MonthlyCalendarProps {
  attendance: AttendanceDay[];
  month: number;
  year: number;
  studentId: string;
}

const statusColors: Record<string, string> = {
  present: "bg-green-500",
  absent: "bg-red-500",
  tardy: "bg-yellow-500",
  excused: "bg-blue-500",
};

export function MonthlyCalendar({
  attendance: initialAttendance,
  month: initialMonth,
  year: initialYear,
  studentId,
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [attendance, setAttendance] = useState<AttendanceDay[]>(initialAttendance);
  const [isPending, startTransition] = useTransition();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  // Map attendance by date string
  const attendanceMap = new Map<string, AttendanceDay>();
  for (const a of attendance) {
    attendanceMap.set(a.attendance_date, a);
  }

  const navigate = (direction: -1 | 1) => {
    startTransition(async () => {
      let newMonth = currentMonth + direction;
      let newYear = currentYear;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);

      const data = await getStudentAttendanceForMonth(studentId, newMonth, newYear);
      setAttendance(data);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">
          Attendance Calendar
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => navigate(-1)} disabled={isPending}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[140px] text-center">
            {monthNames[currentMonth - 1]} {currentYear}
          </span>
          <Button size="sm" variant="ghost" onClick={() => navigate(1)} disabled={isPending}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = attendanceMap.get(dateStr);
            const today = new Date();
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() + 1 &&
              currentYear === today.getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded-md text-xs relative ${
                  isToday ? "ring-2 ring-brand-accent" : ""
                } ${record ? "bg-muted/50" : ""}`}
              >
                <span className={`${isToday ? "font-bold text-brand-accent" : "text-foreground"}`}>
                  {day}
                </span>
                {record && (
                  <div
                    className={`w-2 h-2 rounded-full mt-0.5 ${statusColors[record.status] || "bg-gray-400"}`}
                    title={`${record.status}${record.actual_hours ? ` — ${record.actual_hours}hrs` : ""}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 justify-center">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
