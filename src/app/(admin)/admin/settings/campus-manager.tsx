"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, Pencil } from "lucide-react";
import { createCampus, updateCampus, toggleCampusActive } from "@/lib/actions/settings";

interface Campus {
  id: string;
  name: string;
  code: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string | null;
  is_active: boolean;
}

interface CampusManagerProps {
  campuses: Campus[];
}

const emptyForm = { name: "", code: "", address_line1: "", address_line2: "", city: "", state: "", zip: "", phone: "", email: "" };

export function CampusManager({ campuses }: CampusManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEdit = (c: Campus) => {
    setEditing(c);
    setForm({
      name: c.name,
      code: c.code,
      address_line1: c.address_line1,
      address_line2: c.address_line2 || "",
      city: c.city,
      state: c.state,
      zip: c.zip,
      phone: c.phone,
      email: c.email || "",
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    startTransition(async () => {
      const data = {
        name: form.name,
        code: form.code,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
        email: form.email || null,
      };
      const res = editing
        ? await updateCampus(editing.id, data)
        : await createCampus(data);
      if (res.error) showFB("error", res.error);
      else {
        showFB("success", editing ? "Campus updated" : "Campus created");
        setShowDialog(false);
      }
    });
  };

  const handleToggle = (c: Campus) => {
    startTransition(async () => {
      const res = await toggleCampusActive(c.id, !c.is_active);
      if (res.error) showFB("error", res.error);
      else showFB("success", `Campus ${c.is_active ? "deactivated" : "activated"}`);
    });
  };

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Campuses
            </CardTitle>
            <CardDescription>Manage campus locations</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Campus</Button>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div className={`mb-4 rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              {feedback.text}
            </div>
          )}
          {campuses.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No campuses configured.</p>
          ) : (
            <div className="space-y-3">
              {campuses.map((c) => (
                <div key={c.id} className={`flex items-center justify-between p-4 rounded-lg border border-border ${!c.is_active ? "opacity-60" : ""}`}>
                  <div>
                    <p className="font-medium text-foreground">{c.name} <span className="text-xs text-muted-foreground font-mono">({c.code})</span></p>
                    <p className="text-sm text-muted-foreground">
                      {c.address_line1}{c.city && `, ${c.city}`}{c.state && `, ${c.state}`} {c.zip}
                    </p>
                    {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={c.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggle(c)}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Campus" : "Add Campus"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name *</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Code *</label>
                <input type="text" value={form.code} onChange={(e) => set("code", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g., MAIN" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Address</label>
              <input type="text" value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Address Line 2</label>
              <input type="text" value={form.address_line2} onChange={(e) => set("address_line2", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">City</label>
                <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">State</label>
                <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" maxLength={2} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">ZIP</label>
                <input type="text" value={form.zip} onChange={(e) => set("zip", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
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
