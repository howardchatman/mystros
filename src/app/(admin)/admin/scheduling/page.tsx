import { getProgramSchedules, getCalendarEvents } from "@/lib/actions/scheduling";
import { createClient } from "@/lib/supabase/server";
import { ScheduleManager } from "./schedule-manager";

export const metadata = {
  title: "Scheduling | Admin Dashboard",
  description: "Manage program schedules and calendar events",
};

export default async function SchedulingPage() {
  const now = new Date();
  const supabase = await createClient();

  const [scheduleResult, eventsResult, { data: programs }] = await Promise.all([
    getProgramSchedules(),
    getCalendarEvents(now.getMonth() + 1, now.getFullYear()),
    supabase.from("programs").select("id, name").eq("is_active", true).order("name"),
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
        programs={(programs || []).map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
