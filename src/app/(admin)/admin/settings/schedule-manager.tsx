"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Plus, Pencil } from "lucide-react";
import { createProgramSchedule, updateProgramSchedule, deleteProgramSchedule } from "@/lib/actions/settings";

interface Schedule {
  id: string;
  program_id: string;
  name: string;
  hours_per_week: number;
  days_per_week: number;
  start_time: string | null;
  end_time: string | null;
  expected_weeks: number;
  is_active: boolean;
  program?: { name: string } | { name: string }[] | null;
}

interface ProgramOption {
  id: string;
  name: string;
}

interface ScheduleManagerProps {
  schedules: Schedule[];
  programs: ProgramOption[];
}

const emptyForm = {
  program_id: "", name: "", hours_per_week: "30", days_per_week: "5",
  start_time: "09:00", end_time: "15:00", expected_weeks: "52",
};

export function ScheduleManager({ schedules, programs }: ScheduleManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState({ ...emptyForm, program_id: programs[0]?.id || "" });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, program_id: programs[0]?.id || "" });
    setShowDialog(true);
  };

  const openEdit = (s: Schedule) => {
    setEditing(s);
    setForm({
      program_id: s.program_id, name: s.name,
      hours_per_week: String(s.hours_per_week), days_per_week: String(s.days_per_week),
      start_time: s.start_time || "09:00", end_time: s.end_time || "15:00",
      expected_weeks: String(s.expected_weeks),
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.program_id) return;
    startTransition(async () => {
      const data = {
        program_id: form.program_id, name: form.name,
        hours_per_week: parseInt(form.hours_per_week) || 0,
        days_per_week: parseInt(form.days_per_week) || 0,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        expected_weeks: parseInt(form.expected_weeks) || 0,
      };
      const res = editing ? await updateProgramSchedule(editing.id, data) : await createProgramSchedule(data);
      if (res.error) showFB("error", res.error);
      else { showFB("success", editing ? "Schedule updated" : "Schedule created"); setShowDialog(false); }
    });
  };

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      const res = await deleteProgramSchedule(id);
      if (res.error) showFB("error", res.error);
      else showFB("success", "Schedule deactivated");
    });
  };

  const getProgramName = (s: Schedule) => {
    if (!s.program) return "—";
    if (Array.isArray(s.program)) return s.program[0]?.name || "—";
    return s.program.name;
  };

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Program Schedules</CardTitle>
            <CardDescription>Manage class schedules</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate} disabled={programs.length === 0}><Plus className="w-4 h-4 mr-1" /> Add Schedule</Button>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div className={`mb-4 rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              {feedback.text}
            </div>
          )}
          {schedules.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No schedules configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Schedule</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours/Week</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id} className={`border-b border-border hover:bg-muted/50 ${!s.is_active ? "opacity-60" : ""}`}>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{s.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{getProgramName(s)}</td>
                      <td className="py-3 px-4 text-sm">{s.hours_per_week}h ({s.days_per_week} days)</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={s.is_active ? "default" : "secondary"}>
                          {s.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Schedule" : "Add Schedule"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name *</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g., Day Program" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Program *</label>
                <select value={form.program_id} onChange={(e) => set("program_id", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Hours/Week</label>
                <input type="number" value={form.hours_per_week} onChange={(e) => set("hours_per_week", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Days/Week</label>
                <input type="number" value={form.days_per_week} onChange={(e) => set("days_per_week", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" min={1} max={7} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Start Time</label>
                <input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Time</label>
                <input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Expected Weeks</label>
              <input type="number" value={form.expected_weeks} onChange={(e) => set("expected_weeks", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={isPending}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
