"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, CheckSquare, Square } from "lucide-react";
import { bulkMarkAbsent, getAttendableStudents } from "@/lib/actions/attendance";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
}

interface BulkAttendanceProps {
  campusId: string;
}

export function BulkAttendance({ campusId }: BulkAttendanceProps) {
  const [isPending, startTransition] = useTransition();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelected(new Set());
    getAttendableStudents(campusId).then((data) => {
      setStudents((data || []) as Student[]);
      setLoading(false);
    });
  }, [campusId]);

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

  const handleBulkAbsent = () => {
    if (selected.size === 0) return;
    startTransition(async () => {
      const res = await bulkMarkAbsent(Array.from(selected), campusId);
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({ type: "success", text: `Marked ${res.count} student(s) absent` });
        setSelected(new Set());
        // Refresh list
        const data = await getAttendableStudents(campusId);
        setStudents((data || []) as Student[]);
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        All students have already been marked for today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback && (
        <div className={`rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
          {feedback.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={toggleAll}>
          {selected.size === students.length ? "Deselect All" : "Select All"}
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{selected.size} selected</Badge>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBulkAbsent}
            disabled={selected.size === 0}
            isLoading={isPending}
          >
            <UserX className="w-3.5 h-3.5 mr-1" /> Mark Absent
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
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              {s.student_number}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
