"use client";

import { DollarSign, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialAccount {
  total_charges: number;
  total_payments: number;
  total_aid_posted: number;
  current_balance: number;
}

interface FinancialSummaryCardProps {
  account: FinancialAccount | null;
}

export function FinancialSummaryCard({ account }: FinancialSummaryCardProps) {
  if (!account) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Financial Summary</CardTitle>
          <DollarSign className="h-5 w-5 text-brand-accent" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-brand-muted text-center py-4">
            No financial information available
          </p>
        </CardContent>
      </Card>
    );
  }

  const balanceColor =
    account.current_balance > 0
      ? "text-red-400"
      : account.current_balance < 0
      ? "text-green-400"
      : "text-brand-text";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Financial Summary</CardTitle>
        <DollarSign className="h-5 w-5 text-brand-accent" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="text-center py-2">
          <p className="text-sm text-brand-muted mb-1">Current Balance</p>
          <p className={`text-3xl font-bold ${balanceColor}`}>
            ${Math.abs(account.current_balance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          {account.current_balance < 0 && (
            <p className="text-xs text-green-400 mt-1">Credit Balance</p>
          )}
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
              <span className="text-sm text-brand-muted">Total Charges</span>
            </div>
            <span className="text-sm text-brand-text font-medium">
              ${account.total_charges.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-brand-muted">Payments Made</span>
            </div>
            <span className="text-sm text-brand-text font-medium">
              ${account.total_payments.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-brand-muted">Financial Aid Posted</span>
            </div>
            <span className="text-sm text-brand-text font-medium">
              ${account.total_aid_posted.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
