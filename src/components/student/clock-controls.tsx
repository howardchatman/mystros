"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { studentClockIn, studentClockOut } from "@/lib/actions/student-attendance";
import { toast } from "sonner";

interface ClockControlsProps {
  activeRecord: {
    id: string;
    clock_in_time: string | null;
    clock_out_time: string | null;
    actual_hours: number | null;
  } | null;
}

export function ClockControls({ activeRecord }: ClockControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ hours?: number } | null>(null);

  const isClockedIn = activeRecord && activeRecord.clock_in_time && !activeRecord.clock_out_time;
  const isCompleted = activeRecord && activeRecord.clock_out_time;

  function handleClockIn() {
    startTransition(async () => {
      const res = await studentClockIn();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("You have been clocked in for today.");
      }
    });
  }

  function handleClockOut() {
    startTransition(async () => {
      const res = await studentClockOut();
      if (res.error) {
        toast.error(res.error);
      } else {
        const data = res.data as { actualHours: number } | undefined;
        if (data) {
          setResult({ hours: data.actualHours });
        }
        toast.success("You have been clocked out for today.");
      }
    });
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isClockedIn
                  ? "bg-green-500/20"
                  : isCompleted
                  ? "bg-blue-500/20"
                  : "bg-muted"
              }`}
            >
              <Clock
                className={`w-5 h-5 ${
                  isClockedIn
                    ? "text-green-500"
                    : isCompleted
                    ? "text-blue-500"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isClockedIn
                  ? `Clocked in since ${formatTime(activeRecord!.clock_in_time!)}`
                  : isCompleted
                  ? `Today: ${result?.hours ?? activeRecord!.actual_hours ?? 0} hours logged`
                  : "Not clocked in today"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isClockedIn
                  ? "Remember to clock out when you leave"
                  : isCompleted
                  ? "See you tomorrow!"
                  : "Clock in to start tracking your hours"}
              </p>
            </div>
          </div>

          <div>
            {isClockedIn ? (
              <Button
                variant="outline"
                onClick={handleClockOut}
                disabled={isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isPending ? "Clocking out..." : "Clock Out"}
              </Button>
            ) : !isCompleted ? (
              <Button
                variant="primary"
                onClick={handleClockIn}
                disabled={isPending}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isPending ? "Clocking in..." : "Clock In"}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
