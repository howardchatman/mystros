"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface StudentFinancialSectionProps {
  account: {
    total_charges: number;
    total_payments: number;
    total_aid_posted: number;
    current_balance: number;
    has_payment_plan: boolean;
  } | null;
  aidRecords: {
    id: string;
    academic_year: string;
    status: string;
    efc: number | null;
    verification_required: boolean;
    verification_status: string | null;
    awards: {
      id: string;
      award_name: string;
      award_type: string;
      offered_amount: number;
      accepted_amount: number | null;
      status: string;
    }[];
  }[];
  disbursements: {
    id: string;
    disbursement_number: number;
    scheduled_date: string;
    scheduled_amount: number;
    actual_date: string | null;
    actual_amount: number | null;
    status: string;
  }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const aidStatusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  in_review: { label: "In Review", variant: "secondary" },
  packaged: { label: "Packaged", variant: "default" },
  accepted: { label: "Accepted", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export function StudentFinancialSection({ account, aidRecords, disbursements }: StudentFinancialSectionProps) {
  return (
    <div className="space-y-4">
      {/* Account Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Charges</p>
            <p className="text-2xl font-bold">{fmt(account?.total_charges ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-2xl font-bold">{fmt(account?.total_payments ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aid Posted</p>
            <p className="text-2xl font-bold">{fmt(account?.total_aid_posted ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className={`text-2xl font-bold ${(account?.current_balance ?? 0) > 0 ? "text-destructive" : ""}`}>
              {fmt(account?.current_balance ?? 0)}
            </p>
            {account?.has_payment_plan && (
              <Badge variant="secondary" className="mt-1">Payment Plan</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aid Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial Aid Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aidRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No financial aid records.</p>
          ) : (
            <div className="space-y-4">
              {aidRecords.map((rec) => {
                const sb = aidStatusBadge[rec.status] || { label: rec.status, variant: "outline" as const };
                return (
                  <div key={rec.id} className="rounded-md border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{rec.academic_year}</p>
                        {rec.efc !== null && (
                          <p className="text-xs text-muted-foreground">EFC: {fmt(rec.efc)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.verification_required && (
                          <Badge variant={rec.verification_status === "completed" ? "default" : "secondary"}>
                            V: {rec.verification_status || "Pending"}
                          </Badge>
                        )}
                        <Badge variant={sb.variant}>{sb.label}</Badge>
                      </div>
                    </div>
                    {rec.awards.length > 0 && (
                      <div className="divide-y divide-border">
                        {rec.awards.map((award) => (
                          <div key={award.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-sm">
                            <div>
                              <span className="font-medium">{award.award_name}</span>
                              <span className="text-muted-foreground ml-2">{award.award_type}</span>
                            </div>
                            <div className="text-right">
                              <span>{fmt(award.accepted_amount ?? award.offered_amount)}</span>
                              <Badge variant="outline" className="ml-2 text-xs">{award.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disbursements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disbursements</CardTitle>
        </CardHeader>
        <CardContent>
          {disbursements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No disbursements scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Scheduled</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium text-right">Actual</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursements.map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="py-2">{d.disbursement_number}</td>
                      <td className="py-2">{new Date(d.scheduled_date).toLocaleDateString()}</td>
                      <td className="py-2 text-right">{fmt(d.scheduled_amount)}</td>
                      <td className="py-2 text-right">{d.actual_amount !== null ? fmt(d.actual_amount) : "—"}</td>
                      <td className="py-2 text-right">
                        <Badge
                          variant={
                            d.status === "released" ? "default" :
                            d.status === "on_hold" ? "destructive" : "outline"
                          }
                        >
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
