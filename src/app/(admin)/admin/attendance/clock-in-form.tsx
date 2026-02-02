"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Search, Users } from "lucide-react";
import { getAttendableStudents, clockIn, bulkClockIn } from "@/lib/actions/attendance";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  campus_id: string;
  program: { name: string } | { name: string }[] | null;
}

interface ClockInFormProps {
  campusId: string;
  onClockIn: () => void;
}

export function ClockInForm({ campusId, onClockIn }: ClockInFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAttendableStudents(campusId).then((data) => {
      if (!cancelled) setStudents(data as unknown as Student[]);
    });
    return () => { cancelled = true; };
  }, [campusId]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.student_number.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  };

  const handleClockIn = () => {
    if (selected.size === 0) return;
    setMessage(null);

    startTransition(async () => {
      if (selected.size === 1) {
        const studentId = Array.from(selected)[0]!;
        const result = await clockIn(studentId, campusId);
        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({ type: "success", text: "Student clocked in" });
          setSelected(new Set());
          // Refresh the attendable students list
          const data = await getAttendableStudents(campusId);
          setStudents(data as unknown as Student[]);
          onClockIn();
        }
      } else {
        const result = await bulkClockIn(Array.from(selected), campusId);
        if (result.error && !result.inserted) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({
            type: "success",
            text: `${result.inserted} student(s) clocked in${result.skipped ? `, ${result.skipped} skipped` : ""}`,
          });
          setSelected(new Set());
          const data = await getAttendableStudents(campusId);
          setStudents(data as unknown as Student[]);
          onClockIn();
        }
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <LogIn className="w-5 h-5" />
          Clock In Students
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`rounded-md px-3 py-2 text-sm ${
              message.type === "success"
                ? "bg-green-500/10 text-green-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Select all + Clock in button */}
        <div className="flex items-center justify-between">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Checkbox
              checked={filtered.length > 0 && selected.size === filtered.length}
            />
            <span>Select All ({filtered.length})</span>
          </button>

          <Button
            onClick={handleClockIn}
            disabled={selected.size === 0 || isPending}
            isLoading={isPending}
            size="default"
          >
            <Users className="w-4 h-4 mr-2" />
            Clock In ({selected.size})
          </Button>
        </div>

        {/* Student list */}
        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              {students.length === 0
                ? "All students are already clocked in today"
                : "No students match your search"}
            </p>
          ) : (
            filtered.map((student) => {
              const program = student.program
                ? Array.isArray(student.program)
                  ? student.program[0]?.name
                  : student.program.name
                : null;

              return (
                <button
                  key={student.id}
                  onClick={() => toggleSelect(student.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selected.has(student.id)
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <Checkbox checked={selected.has(student.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.student_number}
                      {program && ` · ${program}`}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
