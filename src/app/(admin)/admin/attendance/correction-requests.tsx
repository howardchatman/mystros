"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X } from "lucide-react";
import { getPendingCorrections, approveAttendanceCorrection } from "@/lib/actions/attendance";

interface Correction {
  id: string;
  attendance_date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  actual_hours: number | null;
  correction_reason: string | null;
  created_at: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_number: string;
  } | null;
}

interface CorrectionRequestsProps {
  onAction: () => void;
}

export function CorrectionRequests({ onAction }: CorrectionRequestsProps) {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPendingCorrections().then((data) => {
      if (!cancelled) setCorrections(data as unknown as Correction[]);
    });
    return () => { cancelled = true; };
  }, []);

  const handleAction = (id: string, approved: boolean) => {
    setActionId(id);
    startTransition(async () => {
      await approveAttendanceCorrection(id, approved);
      const data = await getPendingCorrections();
      setCorrections(data as unknown as Correction[]);
      setActionId(null);
      onAction();
    });
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          Pending Corrections ({corrections.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {corrections.length === 0 ? (
          <p className="text-center py-6 text-sm text-muted-foreground">
            No pending corrections
          </p>
        ) : (
          <div className="space-y-3">
            {corrections.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {c.student?.first_name} {c.student?.last_name}
                    <span className="text-muted-foreground font-normal ml-2">
                      {c.student?.student_number}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.attendance_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · "}
                    {formatTime(c.clock_in_time)} – {formatTime(c.clock_out_time)}
                    {" · "}
                    {(c.actual_hours || 0).toFixed(2)} hrs
                  </p>
                  {c.correction_reason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      &ldquo;{c.correction_reason}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(c.id, false)}
                    disabled={isPending && actionId === c.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAction(c.id, true)}
                    disabled={isPending && actionId === c.id}
                    isLoading={isPending && actionId === c.id}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
