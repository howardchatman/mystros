"use client";

import { GraduationCap, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface FinancialAidRecord {
  aid_status: string;
  academic_year: string;
  fafsa_submitted: boolean;
  isir_received: boolean;
  verification_required: boolean;
  verification_status: string | null;
  awards?: Array<{
    award_name: string;
    offered_amount: number;
    accepted_amount: number;
    status: string;
  }>;
}

interface FinancialAidStatusCardProps {
  financialAid: FinancialAidRecord | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  not_started: { label: "Not Started", color: "text-gray-400", icon: Clock },
  fafsa_submitted: { label: "FAFSA Submitted", color: "text-blue-400", icon: Clock },
  isir_received: { label: "ISIR Received", color: "text-blue-400", icon: Clock },
  verification_required: { label: "Verification Required", color: "text-yellow-400", icon: AlertTriangle },
  verification_complete: { label: "Verification Complete", color: "text-green-400", icon: CheckCircle2 },
  packaged: { label: "Aid Packaged", color: "text-green-400", icon: CheckCircle2 },
  accepted: { label: "Aid Accepted", color: "text-green-500", icon: CheckCircle2 },
  declined: { label: "Declined", color: "text-red-400", icon: AlertTriangle },
};

export function FinancialAidStatusCard({ financialAid }: FinancialAidStatusCardProps) {
  if (!financialAid) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Financial Aid</CardTitle>
          <GraduationCap className="h-5 w-5 text-brand-accent" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-brand-muted text-center py-4">
            No financial aid information available
          </p>
        </CardContent>
      </Card>
    );
  }

  const defaultStatus = { label: "Not Started", color: "text-gray-400", icon: Clock };
  const status = statusConfig[financialAid.aid_status] || defaultStatus;
  const StatusIcon = status.icon;

  const totalAwarded = financialAid.awards?.reduce(
    (sum, award) => sum + (award.accepted_amount || 0),
    0
  ) || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Financial Aid</CardTitle>
        <GraduationCap className="h-5 w-5 text-brand-accent" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-bg/50">
          <StatusIcon className={cn("w-5 h-5", status.color)} />
          <div>
            <p className={cn("text-sm font-medium", status.color)}>{status.label}</p>
            <p className="text-xs text-brand-muted">{financialAid.academic_year}</p>
          </div>
        </div>

        {/* Progress checklist */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {financialAid.fafsa_submitted ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-brand-muted" />
            )}
            <span className={cn("text-sm", financialAid.fafsa_submitted ? "text-brand-text" : "text-brand-muted")}>
              FAFSA Submitted
            </span>
          </div>

          <div className="flex items-center gap-2">
            {financialAid.isir_received ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-brand-muted" />
            )}
            <span className={cn("text-sm", financialAid.isir_received ? "text-brand-text" : "text-brand-muted")}>
              ISIR Received
            </span>
          </div>

          {financialAid.verification_required && (
            <div className="flex items-center gap-2">
              {financialAid.verification_status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm text-brand-text">
                Verification {financialAid.verification_status === "completed" ? "Complete" : "Required"}
              </span>
            </div>
          )}
        </div>

        {/* Awards summary */}
        {financialAid.awards && financialAid.awards.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-brand-muted mb-2">Awards Accepted</p>
            <p className="text-2xl font-bold text-green-400">
              ${totalAwarded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2 space-y-1">
              {financialAid.awards.slice(0, 3).map((award, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-brand-muted">{award.award_name}</span>
                  <span className="text-brand-text">
                    ${award.accepted_amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
