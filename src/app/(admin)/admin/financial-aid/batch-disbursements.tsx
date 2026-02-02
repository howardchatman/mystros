"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckSquare, Square } from "lucide-react";
import { batchReleaseDisbursements } from "@/lib/actions/financial-aid";

interface Disbursement {
  id: string;
  amount: number;
  scheduled_date: string | null;
  status: string;
  student: { first_name: string; last_name: string; student_number: string } | null;
  award: { award_name: string; award_type: string } | null;
}

interface BatchDisbursementsProps {
  disbursements: Disbursement[];
}

export function BatchDisbursements({ disbursements }: BatchDisbursementsProps) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === disbursements.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(disbursements.map((d) => d.id)));
    }
  };

  const handleRelease = () => {
    if (selected.size === 0) return;
    startTransition(async () => {
      const res = await batchReleaseDisbursements(Array.from(selected));
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({ type: "success", text: `Released ${res.count} disbursement(s)` });
        setSelected(new Set());
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const totalSelected = disbursements
    .filter((d) => selected.has(d.id))
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  if (disbursements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Batch Disbursements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">No pending disbursements to release.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" /> Batch Disbursements
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{selected.size} selected</Badge>
          {totalSelected > 0 && (
            <Badge variant="secondary">${totalSelected.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Badge>
          )}
          <Button
            size="sm"
            onClick={handleRelease}
            disabled={selected.size === 0}
            isLoading={isPending}
          >
            Release Selected
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {feedback && (
          <div className={`mb-4 rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
            {feedback.text}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <Button size="sm" variant="outline" onClick={toggleAll}>
            {selected.size === disbursements.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground w-8"></th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Award</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Scheduled</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {disbursements.map((d) => {
                const student = d.student as { first_name?: string; last_name?: string; student_number?: string } | null;
                const award = d.award as { award_name?: string; award_type?: string } | null;
                return (
                  <tr
                    key={d.id}
                    onClick={() => toggle(d.id)}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer"
                  >
                    <td className="py-2 px-3">
                      {selected.has(d.id) ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      <span className="font-medium">{student?.first_name} {student?.last_name}</span>
                      <span className="text-xs text-muted-foreground font-mono ml-2">{student?.student_number}</span>
                    </td>
                    <td className="py-2 px-3 text-sm">{award?.award_name || award?.award_type || "—"}</td>
                    <td className="py-2 px-3 text-sm text-muted-foreground">{d.scheduled_date || "—"}</td>
                    <td className="py-2 px-3 text-sm text-right font-medium">
                      ${Number(d.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
