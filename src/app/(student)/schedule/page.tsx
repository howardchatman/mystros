import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getStudentSchedule,
  getStudentAttendanceForMonth,
} from "@/lib/actions/scheduling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { MonthlyCalendar } from "./monthly-calendar";

export const metadata = {
  title: "Schedule | Student Portal",
};

export default async function SchedulePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, program:programs(name), campus:campuses(name)")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">View your class schedule and calendar</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No student record found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const [scheduleData, attendance] = await Promise.all([
    getStudentSchedule(student.id),
    getStudentAttendanceForMonth(student.id, now.getMonth() + 1, now.getFullYear()),
  ]);

  const { schedule, events } = scheduleData;
  const program = student.program as { name: string } | { name: string }[] | null;
  const campus = student.campus as { name: string } | { name: string }[] | null;
  const programName = Array.isArray(program) ? program[0]?.name : program?.name;
  const campusName = Array.isArray(campus) ? campus[0]?.name : campus?.name;

  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Schedule</h1>
        <p className="text-muted-foreground">View your class schedule and attendance calendar</p>
      </div>

      {/* Program Schedule */}
      {schedule ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" /> My Class Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {programName || "Program"}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {campusName || "Campus"}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayOrder.map((day) => {
                  const isScheduled = (schedule.days_of_week || []).includes(day);
                  return (
                    <div
                      key={day}
                      className={`text-center p-3 rounded-lg ${
                        isScheduled
                          ? "bg-brand-accent/10 border border-brand-accent/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <p className={`text-xs font-medium ${isScheduled ? "text-brand-accent" : "text-muted-foreground"}`}>
                        {day}
                      </p>
                      {isScheduled && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {schedule.start_time?.slice(0, 5)} - {schedule.end_time?.slice(0, 5)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-muted-foreground">
                {schedule.schedule_name} &middot; {schedule.daily_hours} hours per day
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No schedule assigned yet</p>
          </CardContent>
        </Card>
      )}

      {/* Attendance Calendar */}
      <MonthlyCalendar
        attendance={attendance}
        month={now.getMonth() + 1}
        year={now.getFullYear()}
        studentId={student.id}
      />

      {/* Upcoming Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event: any) => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <Badge variant="outline" className="capitalize text-xs">
                    {event.event_type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
