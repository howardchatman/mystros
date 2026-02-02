"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GraduationCap, Plus, Pencil } from "lucide-react";
import { createProgram, updateProgram, toggleProgramActive } from "@/lib/actions/settings";

interface Program {
  id: string;
  name: string;
  code: string;
  description: string | null;
  total_hours: number;
  theory_hours: number;
  practical_hours: number;
  tuition_amount: number;
  books_supplies_amount: number;
  registration_fee: number;
  duration_weeks: number;
  is_active: boolean;
}

interface ProgramManagerProps {
  programs: Program[];
}

const emptyForm = {
  name: "", code: "", description: "",
  total_hours: "1500", theory_hours: "500", practical_hours: "1000",
  tuition_amount: "0", books_supplies_amount: "0", registration_fee: "0",
  duration_weeks: "52",
};

export function ProgramManager({ programs }: ProgramManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowDialog(true); };

  const openEdit = (p: Program) => {
    setEditing(p);
    setForm({
      name: p.name, code: p.code, description: p.description || "",
      total_hours: String(p.total_hours), theory_hours: String(p.theory_hours),
      practical_hours: String(p.practical_hours), tuition_amount: String(p.tuition_amount),
      books_supplies_amount: String(p.books_supplies_amount), registration_fee: String(p.registration_fee),
      duration_weeks: String(p.duration_weeks),
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    startTransition(async () => {
      const data = {
        name: form.name, code: form.code, description: form.description || null,
        total_hours: parseInt(form.total_hours) || 0,
        theory_hours: parseInt(form.theory_hours) || 0,
        practical_hours: parseInt(form.practical_hours) || 0,
        tuition_amount: parseFloat(form.tuition_amount) || 0,
        books_supplies_amount: parseFloat(form.books_supplies_amount) || 0,
        registration_fee: parseFloat(form.registration_fee) || 0,
        duration_weeks: parseInt(form.duration_weeks) || 0,
      };
      const res = editing ? await updateProgram(editing.id, data) : await createProgram(data);
      if (res.error) showFB("error", res.error);
      else { showFB("success", editing ? "Program updated" : "Program created"); setShowDialog(false); }
    });
  };

  const handleToggle = (p: Program) => {
    startTransition(async () => {
      const res = await toggleProgramActive(p.id, !p.is_active);
      if (res.error) showFB("error", res.error);
      else showFB("success", `Program ${p.is_active ? "deactivated" : "activated"}`);
    });
  };

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Programs</CardTitle>
            <CardDescription>Manage academic programs</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Program</Button>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div className={`mb-4 rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              {feedback.text}
            </div>
          )}
          {programs.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No programs configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tuition</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.id} className={`border-b border-border hover:bg-muted/50 ${!p.is_active ? "opacity-60" : ""}`}>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{p.name}</p>
                        {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {p.total_hours} total <span className="text-muted-foreground">({p.theory_hours}T / {p.practical_hours}P)</span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        ${Number(p.tuition_amount).toLocaleString()}
                        {p.registration_fee > 0 && <span className="text-muted-foreground"> + ${Number(p.registration_fee).toLocaleString()} reg</span>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={p.is_active ? "default" : "secondary"} className="cursor-pointer" onClick={() => handleToggle(p)}>
                          {p.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Program" : "Add Program"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name *</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Code *</label>
                <input type="text" value={form.code} onChange={(e) => set("code", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Total Hours</label>
                <input type="number" value={form.total_hours} onChange={(e) => set("total_hours", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Theory Hours</label>
                <input type="number" value={form.theory_hours} onChange={(e) => set("theory_hours", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Practical Hours</label>
                <input type="number" value={form.practical_hours} onChange={(e) => set("practical_hours", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Tuition ($)</label>
                <input type="number" value={form.tuition_amount} onChange={(e) => set("tuition_amount", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Books/Supplies ($)</label>
                <input type="number" value={form.books_supplies_amount} onChange={(e) => set("books_supplies_amount", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Registration Fee ($)</label>
                <input type="number" value={form.registration_fee} onChange={(e) => set("registration_fee", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Duration (weeks)</label>
              <input type="number" value={form.duration_weeks} onChange={(e) => set("duration_weeks", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
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
