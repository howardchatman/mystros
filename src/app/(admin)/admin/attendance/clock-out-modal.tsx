"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { clockOut } from "@/lib/actions/attendance";

interface ClockOutModalProps {
  record: {
    id: string;
    clock_in_time: string;
    student: {
      id: string;
      first_name: string;
      last_name: string;
      student_number: string;
    } | null;
  };
  onClose: () => void;
  onComplete: () => void;
}

export function ClockOutModal({ record, onClose, onComplete }: ClockOutModalProps) {
  const [theoryPercent, setTheoryPercent] = useState(30);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const now = Date.now();
  const clockInMs = new Date(record.clock_in_time).getTime();
  const totalMs = now - clockInMs;
  const totalHours = Math.round((totalMs / 3_600_000) * 100) / 100;
  const theoryHours = Math.round(totalHours * (theoryPercent / 100) * 100) / 100;
  const practicalHours = Math.round((totalHours - theoryHours) * 100) / 100;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await clockOut(record.id, theoryPercent);
      if (result.error) {
        setError(result.error);
      } else {
        onComplete();
      }
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clock Out Student</DialogTitle>
          <DialogDescription>
            Confirm clock-out for {record.student?.first_name} {record.student?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {error && (
            <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Clock In</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(record.clock_in_time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Clock Out</p>
              <p className="text-sm font-medium text-foreground">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
            <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(2)}</p>
          </div>

          {/* Theory/Practical split slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Theory / Practical Split</span>
              <span className="font-medium text-foreground">{theoryPercent}% / {100 - theoryPercent}%</span>
            </div>
            <Slider
              value={[theoryPercent]}
              onValueChange={(values) => setTheoryPercent(values[0] ?? 30)}
              min={0}
              max={100}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Theory: {theoryHours.toFixed(2)} hrs</span>
              <span>Practical: {practicalHours.toFixed(2)} hrs</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} isLoading={isPending}>
            Confirm Clock Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
