"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Play, ShieldAlert, XCircle } from "lucide-react";
import { triggerSapEvaluation } from "@/lib/actions/sap";
import type { SapStatus } from "@/types/database";

const sapStatusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  satisfactory: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    label: "Satisfactory",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    label: "Warning",
  },
  probation: {
    icon: ShieldAlert,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    label: "Probation",
  },
  suspension: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    label: "Suspension",
  },
  appeal_pending: {
    icon: AlertTriangle,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    label: "Appeal Pending",
  },
  appeal_approved: {
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    label: "Appeal Approved",
  },
  appeal_denied: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    label: "Appeal Denied",
  },
};

interface StudentSapSectionProps {
  studentId: string;
  currentStatus: SapStatus | null;
  sapHistory: any[];
}

export function StudentSapSection({
  studentId,
  currentStatus,
  sapHistory,
}: StudentSapSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const status = currentStatus || "satisfactory";
  const config = sapStatusConfig[status] ?? sapStatusConfig["satisfactory"]!;
  const StatusIcon = config!.icon;

  const handleRunEvaluation = () => {
    setResult(null);
    startTransition(async () => {
      const res = await triggerSapEvaluation(studentId);
      if (res.error) {
        setResult({ type: "error", text: res.error });
      } else {
        setResult({
          type: "success",
          text: `SAP evaluation complete: ${res.data?.status} (${res.data?.completionRate}% completion rate)`,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Current status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${config.bgColor}`}>
                <StatusIcon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current SAP Status</p>
                <p className={`text-xl font-bold capitalize ${config.color}`}>
                  {config.label}
                </p>
              </div>
            </div>
            <Button onClick={handleRunEvaluation} isLoading={isPending}>
              <Play className="w-4 h-4 mr-2" />
              Run SAP Evaluation
            </Button>
          </div>

          {result && (
            <div
              className={`mt-4 rounded-md px-3 py-2 text-sm ${
                result.type === "success"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-600"
              }`}
            >
              {result.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Evaluation History</CardTitle>
        </CardHeader>
        <CardContent>
          {sapHistory.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              No SAP evaluations recorded yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Checkpoint</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Completion</th>
                    <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Timeframe</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sapHistory.map((eval_: any) => {
                    const evalConfig = sapStatusConfig[eval_.status] ?? sapStatusConfig["satisfactory"]!;
                    return (
                      <tr key={eval_.id} className="hover:bg-muted/50">
                        <td className="py-2.5 px-3 text-sm text-foreground">
                          {new Date(eval_.evaluation_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-sm text-muted-foreground">
                          {eval_.evaluation_point || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm font-medium text-foreground">
                          {eval_.completion_rate?.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {eval_.is_within_max_timeframe ? (
                            <Badge variant="outline" className="text-green-600">OK</Badge>
                          ) : (
                            <Badge variant="destructive">Exceeded</Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${evalConfig.bgColor} ${evalConfig.color}`}
                          >
                            {evalConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
