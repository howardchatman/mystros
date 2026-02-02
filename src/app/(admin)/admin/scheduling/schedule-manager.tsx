"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/actions/scheduling";

interface CalendarEventItem {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

interface ScheduleItem {
  id: string;
  schedule_name: string;
  days_of_week: string[];
  start_time: string;
  end_time: string;
  daily_hours: number;
  program: { name: string } | { name: string }[] | null;
  campus: { name: string } | { name: string }[] | null;
}

interface ScheduleManagerProps {
  schedules: ScheduleItem[];
  events: CalendarEventItem[];
  currentMonth: number;
  currentYear: number;
}

const eventTypeColors: Record<string, string> = {
  holiday: "bg-red-500/10 text-red-500",
  closure: "bg-orange-500/10 text-orange-500",
  deadline: "bg-yellow-500/10 text-yellow-500",
  event: "bg-blue-500/10 text-blue-500",
  orientation: "bg-green-500/10 text-green-500",
};

export function ScheduleManager({
  schedules,
  events,
  currentMonth,
  currentYear,
}: ScheduleManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("holiday");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allDay, setAllDay] = useState(true);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }

  const handleCreate = () => {
    if (!title || !startDate) return;
    startTransition(async () => {
      const res = await createCalendarEvent({
        title,
        event_type: eventType,
        start_date: startDate,
        end_date: endDate || null,
        all_day: allDay,
      });
      if (res.error) showFB("error", res.error);
      else {
        showFB("success", "Event created");
        setShowCreateDialog(false);
        setTitle("");
        setStartDate("");
        setEndDate("");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCalendarEvent(id);
      if (res.error) showFB("error", res.error);
      else showFB("success", "Event deleted");
    });
  };

  const getName = (obj: { name: string } | { name: string }[] | null) => {
    if (!obj) return "—";
    if (Array.isArray(obj)) return obj[0]?.name || "—";
    return obj.name;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            feedback.type === "success"
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Program Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" /> Program Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No program schedules configured
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Schedule</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Program</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Campus</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Days</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Time</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Daily Hrs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/50">
                      <td className="py-2.5 px-3 text-sm font-medium text-foreground">{s.schedule_name}</td>
                      <td className="py-2.5 px-3 text-sm text-muted-foreground">{getName(s.program)}</td>
                      <td className="py-2.5 px-3 text-sm text-muted-foreground">{getName(s.campus)}</td>
                      <td className="py-2.5 px-3 text-sm">
                        <div className="flex gap-1 flex-wrap">
                          {(s.days_of_week || []).map((d) => (
                            <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-sm text-muted-foreground">
                        {s.start_time} - {s.end_time}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-right font-medium">{s.daily_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" /> Calendar Events — {monthNames[currentMonth - 1]} {currentYear}
          </CardTitle>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Event
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No events this month
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${eventTypeColors[event.event_type] || "bg-muted text-muted-foreground"}`}>
                      {event.event_type}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start_date).toLocaleDateString()}
                        {event.end_date && event.end_date !== event.start_date &&
                          ` — ${new Date(event.end_date).toLocaleDateString()}`}
                        {!event.all_day && event.start_time && ` · ${event.start_time}`}
                        {!event.all_day && event.end_time && ` - ${event.end_time}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(event.id)}
                    disabled={isPending}
                    className="text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Calendar Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="e.g., Spring Break"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="holiday">Holiday</option>
                <option value="closure">Closure</option>
                <option value="deadline">Deadline</option>
                <option value="event">Event</option>
                <option value="orientation">Orientation</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Date (optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                id="all-day"
                className="rounded border-border"
              />
              <label htmlFor="all-day" className="text-sm text-foreground">All day event</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={isPending}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
