"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Plus, Pencil } from "lucide-react";
import { createDocumentType, updateDocumentType, toggleDocumentTypeActive } from "@/lib/actions/settings";

interface DocType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  is_required: boolean;
  is_active: boolean;
}

interface DocumentTypeManagerProps {
  documentTypes: DocType[];
}

const emptyForm = { name: "", code: "", description: "", category: "enrollment", is_required: false };

export function DocumentTypeManager({ documentTypes }: DocumentTypeManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<DocType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowDialog(true); };

  const openEdit = (dt: DocType) => {
    setEditing(dt);
    setForm({ name: dt.name, code: dt.code, description: dt.description || "", category: dt.category, is_required: dt.is_required });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    startTransition(async () => {
      const data = {
        name: form.name, code: form.code,
        description: form.description || null,
        category: form.category,
        is_required: form.is_required,
      };
      const res = editing ? await updateDocumentType(editing.id, data) : await createDocumentType(data);
      if (res.error) showFB("error", res.error);
      else { showFB("success", editing ? "Document type updated" : "Document type created"); setShowDialog(false); }
    });
  };

  const handleToggle = (dt: DocType) => {
    startTransition(async () => {
      const res = await toggleDocumentTypeActive(dt.id, !dt.is_active);
      if (res.error) showFB("error", res.error);
      else showFB("success", `Document type ${dt.is_active ? "deactivated" : "activated"}`);
    });
  };

  const set = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Document Types</CardTitle>
            <CardDescription>Required and optional document configurations</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Type</Button>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div className={`mb-4 rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              {feedback.text}
            </div>
          )}
          {documentTypes.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No document types configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Required</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documentTypes.map((dt) => (
                    <tr key={dt.id} className={`border-b border-border hover:bg-muted/50 ${!dt.is_active ? "opacity-60" : ""}`}>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{dt.name}</p>
                        {dt.description && <p className="text-xs text-muted-foreground line-clamp-1">{dt.description}</p>}
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">{dt.category}</td>
                      <td className="py-3 px-4">
                        <Badge variant={dt.is_required ? "default" : "outline"}>
                          {dt.is_required ? "Required" : "Optional"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={dt.is_active ? "default" : "secondary"} className="cursor-pointer" onClick={() => handleToggle(dt)}>
                          {dt.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(dt)}><Pencil className="w-3.5 h-3.5" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Document Type" : "Add Document Type"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name *</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Code *</label>
                <input type="text" value={form.code} onChange={(e) => set("code", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g., GOV_ID" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="enrollment">Enrollment</option>
                <option value="identification">Identification</option>
                <option value="financial">Financial</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_required} onChange={(e) => set("is_required", e.target.checked)} id="is-required" className="rounded border-border" />
              <label htmlFor="is-required" className="text-sm text-foreground">Required document</label>
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
