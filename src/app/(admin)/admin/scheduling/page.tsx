import { getProgramSchedules, getCalendarEvents } from "@/lib/actions/scheduling";
import { ScheduleManager } from "./schedule-manager";

export const metadata = {
  title: "Scheduling | Admin Dashboard",
  description: "Manage program schedules and calendar events",
};

export default async function SchedulingPage() {
  const now = new Date();
  const [scheduleResult, eventsResult] = await Promise.all([
    getProgramSchedules(),
    getCalendarEvents(now.getMonth() + 1, now.getFullYear()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Scheduling</h1>
        <p className="text-muted-foreground">Manage program schedules and calendar events</p>
      </div>
      <ScheduleManager
        schedules={scheduleResult.data || []}
        events={eventsResult.data || []}
        currentMonth={now.getMonth() + 1}
        currentYear={now.getFullYear()}
      />
    </div>
  );
}
