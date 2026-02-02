"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, CheckSquare, Square } from "lucide-react";
import { bulkUpdateStudentStatus, getStudents } from "@/lib/actions/admin-students";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  status: string;
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "enrolled", label: "Enrolled" },
  { value: "loa", label: "Leave of Absence" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "graduated", label: "Graduated" },
];

export function BulkStatusUpdate() {
  const [isPending, startTransition] = useTransition();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [newStatus, setNewStatus] = useState("active");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getStudents({}, 200, 0).then((res) => {
      setStudents((res.students || []) as Student[]);
      setLoading(false);
    });
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map((s) => s.id)));
    }
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await bulkUpdateStudentStatus(Array.from(selected), newStatus as any);
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({ type: "success", text: `Updated ${res.count} student(s) to ${newStatus}` });
        setSelected(new Set());
        // Refresh
        const fresh = await getStudents({}, 200, 0);
        setStudents((fresh.students || []) as Student[]);
      }
      setShowConfirm(false);
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Bulk Status Update</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Bulk Status Update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {feedback && (
          <div className={`rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
            {feedback.text}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button size="sm" variant="outline" onClick={toggleAll}>
            {selected.size === students.length ? "Deselect All" : "Select All"}
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{selected.size} selected</Badge>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={selected.size === 0}
            >
              Update Status
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-lg divide-y divide-border max-h-80 overflow-y-auto">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors"
            >
              {selected.has(s.id) ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm font-medium text-foreground">
                {s.first_name} {s.last_name}
              </span>
              <Badge variant="outline" className="capitalize ml-auto">{s.status}</Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {s.student_number}
              </span>
            </button>
          ))}
        </div>

        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk Status Change</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              You are about to change the status of <strong>{selected.size}</strong> student(s) to{" "}
              <Badge variant="outline" className="capitalize">{newStatus}</Badge>.
              This action cannot be easily undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={handleConfirm} isLoading={isPending}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
