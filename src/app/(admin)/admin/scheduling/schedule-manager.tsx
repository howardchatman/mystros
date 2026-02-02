"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Clock, Plus, Trash2, Pencil } from "lucide-react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/actions/scheduling";
import {
  createProgramSchedule,
  updateProgramSchedule,
  deleteProgramSchedule,
} from "@/lib/actions/settings";

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

interface ProgramOption {
  id: string;
  name: string;
}

interface ScheduleManagerProps {
  schedules: ScheduleItem[];
  events: CalendarEventItem[];
  currentMonth: number;
  currentYear: number;
  programs: ProgramOption[];
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
  programs,
}: ScheduleManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Event form state
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("holiday");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allDay, setAllDay] = useState(true);

  // Schedule form state
  const [schName, setSchName] = useState("");
  const [schProgramId, setSchProgramId] = useState("");
  const [schStartTime, setSchStartTime] = useState("08:00");
  const [schEndTime, setSchEndTime] = useState("16:00");
  const [schHoursPerWeek, setSchHoursPerWeek] = useState(40);
  const [schDaysPerWeek, setSchDaysPerWeek] = useState(5);
  const [schExpectedWeeks, setSchExpectedWeeks] = useState(52);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }

  function resetScheduleForm() {
    setSchName("");
    setSchProgramId("");
    setSchStartTime("08:00");
    setSchEndTime("16:00");
    setSchHoursPerWeek(40);
    setSchDaysPerWeek(5);
    setSchExpectedWeeks(52);
    setEditingSchedule(null);
  }

  function openCreateSchedule() {
    resetScheduleForm();
    setShowScheduleDialog(true);
  }

  function openEditSchedule(s: ScheduleItem) {
    setEditingSchedule(s);
    setSchName(s.schedule_name || "");
    setSchStartTime(s.start_time || "08:00");
    setSchEndTime(s.end_time || "16:00");
    setSchDaysPerWeek((s.days_of_week || []).length || 5);
    setSchHoursPerWeek(s.daily_hours * ((s.days_of_week || []).length || 5));
    setShowScheduleDialog(true);
  }

  const handleCreateEvent = () => {
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
        setShowCreateEventDialog(false);
        setTitle("");
        setStartDate("");
        setEndDate("");
      }
    });
  };

  const handleDeleteEvent = (id: string) => {
    startTransition(async () => {
      const res = await deleteCalendarEvent(id);
      if (res.error) showFB("error", res.error);
      else showFB("success", "Event deleted");
    });
  };

  const handleSaveSchedule = () => {
    if (!schName) return;
    startTransition(async () => {
      if (editingSchedule) {
        const res = await updateProgramSchedule(editingSchedule.id, {
          name: schName,
          start_time: schStartTime,
          end_time: schEndTime,
          hours_per_week: schHoursPerWeek,
          days_per_week: schDaysPerWeek,
          expected_weeks: schExpectedWeeks,
        });
        if (res.error) showFB("error", res.error);
        else {
          showFB("success", "Schedule updated");
          setShowScheduleDialog(false);
          resetScheduleForm();
        }
      } else {
        if (!schProgramId) return;
        const res = await createProgramSchedule({
          program_id: schProgramId,
          name: schName,
          start_time: schStartTime,
          end_time: schEndTime,
          hours_per_week: schHoursPerWeek,
          days_per_week: schDaysPerWeek,
          expected_weeks: schExpectedWeeks,
        });
        if (res.error) showFB("error", res.error);
        else {
          showFB("success", "Schedule created");
          setShowScheduleDialog(false);
          resetScheduleForm();
        }
      }
    });
  };

  const handleDeleteSchedule = (id: string) => {
    startTransition(async () => {
      const res = await deleteProgramSchedule(id);
      if (res.error) showFB("error", res.error);
      else showFB("success", "Schedule deactivated");
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" /> Program Schedules
          </CardTitle>
          <Button size="sm" onClick={openCreateSchedule}>
            <Plus className="w-4 h-4 mr-1" /> Create Schedule
          </Button>
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
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
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
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSchedule(s)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSchedule(s.id)}
                            disabled={isPending}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
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
          <Button size="sm" onClick={() => setShowCreateEventDialog(true)}>
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
                    onClick={() => handleDeleteEvent(event.id)}
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

      {/* Create/Edit Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={(open) => { if (!open) { setShowScheduleDialog(false); resetScheduleForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Schedule Name</label>
              <Input
                value={schName}
                onChange={(e) => setSchName(e.target.value)}
                placeholder="e.g., Morning Class"
                className="mt-1"
              />
            </div>
            {!editingSchedule && (
              <div>
                <label className="text-sm font-medium text-foreground">Program</label>
                <select
                  value={schProgramId}
                  onChange={(e) => setSchProgramId(e.target.value)}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select program...</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Start Time</label>
                <Input
                  type="time"
                  value={schStartTime}
                  onChange={(e) => setSchStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Time</label>
                <Input
                  type="time"
                  value={schEndTime}
                  onChange={(e) => setSchEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Days/Week</label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={schDaysPerWeek}
                  onChange={(e) => setSchDaysPerWeek(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Hours/Week</label>
                <Input
                  type="number"
                  min={1}
                  value={schHoursPerWeek}
                  onChange={(e) => setSchHoursPerWeek(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Expected Weeks</label>
                <Input
                  type="number"
                  min={1}
                  value={schExpectedWeeks}
                  onChange={(e) => setSchExpectedWeeks(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowScheduleDialog(false); resetScheduleForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} isLoading={isPending}>
              {editingSchedule ? "Save Changes" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
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
            <Button variant="outline" onClick={() => setShowCreateEventDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent} isLoading={isPending}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
