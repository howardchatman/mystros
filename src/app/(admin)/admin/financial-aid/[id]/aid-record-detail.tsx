"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Package,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  updateFinancialAidRecord,
  createAwardPackage,
  updateAward,
  scheduleDisbursement,
  releaseDisbursement,
  holdDisbursement,
  recordCharge,
  voidCharge,
  recordPayment,
} from "@/lib/actions/financial-aid";
import type { AidStatus, DisbursementStatus } from "@/types/database";

interface AidRecordDetailProps {
  record: {
    id: string;
    student_id: string;
    academic_year: string;
    fafsa_submitted: boolean;
    fafsa_submitted_date: string | null;
    efc: number | null;
    isir_received: boolean;
    verification_required: boolean;
    verification_completed_date: string | null;
    status: AidStatus;
    dependency_status: string | null;
    created_at: string;
  };
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_number: string;
    email: string;
    program: { id: string; name: string; total_hours: number } | null;
  } | null;
  awards: {
    id: string;
    award_type: string;
    award_name: string;
    offered_amount: number;
    accepted_amount: number | null;
    status: string;
    created_at: string;
  }[];
  disbursements: {
    id: string;
    financial_aid_award_id: string;
    disbursement_number: number;
    scheduled_date: string;
    scheduled_amount: number;
    actual_date: string | null;
    actual_amount: number | null;
    status: DisbursementStatus;
    hold_reason: string | null;
    notes: string | null;
    award?: { award_type: string; award_name: string } | null;
  }[];
  account: {
    id: string;
    total_charges: number;
    total_payments: number;
    total_aid_posted: number;
    current_balance: number;
  } | null;
  charges: {
    id: string;
    charge_type: string;
    description: string;
    amount: number;
    charge_date: string;
    is_voided: boolean;
    voided_reason: string | null;
  }[];
  payments: {
    id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    status: string;
    is_refund: boolean;
  }[];
}

const statusConfig: Record<string, { color: string; label: string }> = {
  not_started: { color: "text-muted-foreground", label: "Not Started" },
  fafsa_submitted: { color: "text-blue-500", label: "FAFSA Submitted" },
  isir_received: { color: "text-blue-500", label: "ISIR Received" },
  verification_required: { color: "text-yellow-500", label: "Verification Required" },
  verification_complete: { color: "text-green-500", label: "Verification Complete" },
  packaged: { color: "text-green-500", label: "Packaged" },
  accepted: { color: "text-green-600", label: "Accepted" },
  declined: { color: "text-red-500", label: "Declined" },
};

const disbursementStatusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  scheduled: { variant: "outline", label: "Scheduled" },
  pending_release: { variant: "secondary", label: "On Hold" },
  released: { variant: "default", label: "Released" },
  posted: { variant: "default", label: "Posted" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  returned: { variant: "destructive", label: "Returned" },
};

export function AidRecordDetail({
  record,
  student,
  awards,
  disbursements,
  account,
  charges,
  payments,
}: AidRecordDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [showDisbursementDialog, setShowDisbursementDialog] = useState(false);
  const [showChargeDialog, setShowChargeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState<string | null>(null);
  const [showVoidDialog, setShowVoidDialog] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Award form state
  const [awardType, setAwardType] = useState("pell_grant");
  const [awardName, setAwardName] = useState("Federal Pell Grant");
  const [awardAmount, setAwardAmount] = useState("");

  // Disbursement form state
  const [disbAwardId, setDisbAwardId] = useState(awards[0]?.id || "");
  const [disbDate, setDisbDate] = useState("");
  const [disbAmount, setDisbAmount] = useState("");

  // Charge form state
  const [chargeType, setChargeType] = useState("tuition");
  const [chargeDesc, setChargeDesc] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Hold/void reason
  const [holdReason, setHoldReason] = useState("");
  const [voidReason, setVoidReason] = useState("");

  const statusInfo = statusConfig[record.status] || statusConfig["not_started"]!;
  const totalAwarded = awards.reduce((sum, a) => sum + a.offered_amount, 0);
  const totalAccepted = awards.reduce((sum, a) => sum + (a.accepted_amount || 0), 0);

  function showFeedback(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }

  const handleUpdateStatus = (status: AidStatus) => {
    startTransition(async () => {
      const res = await updateFinancialAidRecord(record.id, { status });
      if (res.error) showFeedback("error", res.error);
      else showFeedback("success", `Status updated to ${status.replace(/_/g, " ")}`);
    });
  };

  const handleAddAward = () => {
    if (!awardAmount) return;
    startTransition(async () => {
      const res = await createAwardPackage(record.id, [
        {
          award_type: awardType,
          award_name: awardName,
          offered_amount: parseFloat(awardAmount),
        },
      ]);
      if (res.error) showFeedback("error", res.error);
      else {
        showFeedback("success", "Award added");
        setShowAwardDialog(false);
        setAwardAmount("");
      }
    });
  };

  const handleScheduleDisbursement = () => {
    if (!disbAwardId || !disbDate || !disbAmount) return;
    startTransition(async () => {
      const existingCount = disbursements.filter(
        (d) => d.financial_aid_award_id === disbAwardId
      ).length;
      const res = await scheduleDisbursement({
        financial_aid_award_id: disbAwardId,
        student_id: record.student_id,
        disbursement_number: existingCount + 1,
        scheduled_date: disbDate,
        scheduled_amount: parseFloat(disbAmount),
      });
      if (res.error) showFeedback("error", res.error);
      else {
        showFeedback("success", "Disbursement scheduled");
        setShowDisbursementDialog(false);
        setDisbAmount("");
      }
    });
  };

  const handleReleaseDisbursement = (id: string) => {
    startTransition(async () => {
      const res = await releaseDisbursement(id);
      if (res.error) showFeedback("error", res.error);
      else showFeedback("success", "Disbursement released");
    });
  };

  const handleHoldDisbursement = () => {
    if (!showHoldDialog || !holdReason) return;
    startTransition(async () => {
      const res = await holdDisbursement(showHoldDialog, holdReason);
      if (res.error) showFeedback("error", res.error);
      else {
        showFeedback("success", "Hold placed");
        setShowHoldDialog(null);
        setHoldReason("");
      }
    });
  };

  const handleAddCharge = () => {
    if (!chargeAmount || !chargeDesc || !account) return;
    startTransition(async () => {
      const res = await recordCharge({
        student_account_id: account.id,
        student_id: record.student_id,
        charge_type: chargeType,
        description: chargeDesc,
        amount: parseFloat(chargeAmount),
        charge_date: new Date().toISOString().split("T")[0]!,
      });
      if (res.error) showFeedback("error", res.error);
      else {
        showFeedback("success", "Charge recorded");
        setShowChargeDialog(false);
        setChargeAmount("");
        setChargeDesc("");
      }
    });
  };

  const handleVoidCharge = () => {
    if (!showVoidDialog || !voidReason) return;
    startTransition(async () => {
      const res = await voidCharge(showVoidDialog, voidReason);
      if (res.error) showFeedback("error", res.error);
      else {
        showFeedback("success", "Charge voided");
        setShowVoidDialog(null);
        setVoidReason("");
      }
    });
  };

  const handleAddPayment = () => {
    if (!paymentAmount || !account) return;
    startTransition(async () => {
      const res = await recordPayment({
        student_account_id: account.id,
        student_id: record.student_id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split("T")[0]!,
        status: "completed",
      });
      if (res.error) showFeedback("error", res.error);
      else {
        showFeedback("success", "Payment recorded");
        setShowPaymentDialog(false);
        setPaymentAmount("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/financial-aid">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-foreground">
            {student?.first_name} {student?.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {student?.student_number} &middot; {student?.program?.name || "No Program"} &middot; {record.academic_year}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-sm ${statusInfo.color}`}
        >
          {statusInfo.label}
        </Badge>
      </div>

      {feedback && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            feedback.type === "success"
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground">
              ${totalAwarded.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Awarded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground">
              ${totalAccepted.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground">
              {disbursements.length}
            </p>
            <p className="text-xs text-muted-foreground">Disbursements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className={`text-2xl font-bold ${(account?.current_balance || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
              ${Math.abs(account?.current_balance || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {(account?.current_balance || 0) > 0 ? "Balance Due" : "Credit"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="awards">Awards ({awards.length})</TabsTrigger>
          <TabsTrigger value="disbursements">Disbursements ({disbursements.length})</TabsTrigger>
          <TabsTrigger value="ledger">Account Ledger</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" /> FAFSA & Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">FAFSA Status</p>
                  <p className="font-medium text-foreground">
                    {record.fafsa_submitted ? "Submitted" : "Not Submitted"}
                    {record.fafsa_submitted_date && ` (${new Date(record.fafsa_submitted_date).toLocaleDateString()})`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">ISIR</p>
                  <p className="font-medium text-foreground">
                    {record.isir_received ? "Received" : "Not Received"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">EFC</p>
                  <p className="font-medium text-foreground">
                    {record.efc != null ? `$${Number(record.efc).toLocaleString()}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dependency Status</p>
                  <p className="font-medium text-foreground capitalize">
                    {record.dependency_status || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verification</p>
                  <p className="font-medium text-foreground">
                    {record.verification_required
                      ? record.verification_completed_date
                        ? `Completed (${new Date(record.verification_completed_date).toLocaleDateString()})`
                        : "Required"
                      : "Not Required"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Record Created</p>
                  <p className="font-medium text-foreground">
                    {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <p className="text-sm text-muted-foreground w-full mb-1">Update Status:</p>
                {(["fafsa_submitted", "isir_received", "verification_required", "verification_complete", "packaged", "accepted", "declined"] as AidStatus[]).map(
                  (s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={record.status === s ? "primary" : "outline"}
                      onClick={() => handleUpdateStatus(s)}
                      disabled={isPending}
                      className="capitalize text-xs"
                    >
                      {s.replace(/_/g, " ")}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Awards Tab ── */}
        <TabsContent value="awards">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" /> Award Package
              </CardTitle>
              <Button size="sm" onClick={() => setShowAwardDialog(true)}>
                Add Award
              </Button>
            </CardHeader>
            <CardContent>
              {awards.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground">
                  No awards packaged yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Award</th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Offered</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Accepted</th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {awards.map((award) => (
                        <tr key={award.id} className="hover:bg-muted/50">
                          <td className="py-2.5 px-3 text-sm font-medium text-foreground">{award.award_name}</td>
                          <td className="py-2.5 px-3 text-sm text-muted-foreground capitalize">{award.award_type.replace(/_/g, " ")}</td>
                          <td className="py-2.5 px-3 text-sm text-right font-medium">${award.offered_amount.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-sm text-right">${(award.accepted_amount || 0).toLocaleString()}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className="capitalize">{award.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Disbursements Tab ── */}
        <TabsContent value="disbursements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Disbursements
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowDisbursementDialog(true)}
                disabled={awards.length === 0}
              >
                Schedule Disbursement
              </Button>
            </CardHeader>
            <CardContent>
              {disbursements.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground">
                  No disbursements scheduled
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Award</th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">#</th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Scheduled</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {disbursements.map((d) => {
                        const awardInfo = d.award as { award_type?: string; award_name?: string } | null;
                        const dConfig = disbursementStatusConfig[d.status] || { variant: "outline" as const, label: d.status };
                        return (
                          <tr key={d.id} className="hover:bg-muted/50">
                            <td className="py-2.5 px-3 text-sm text-foreground">
                              {awardInfo?.award_name || "—"}
                            </td>
                            <td className="py-2.5 px-3 text-sm text-muted-foreground">
                              #{d.disbursement_number}
                            </td>
                            <td className="py-2.5 px-3 text-sm text-foreground">
                              {new Date(d.scheduled_date).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-sm text-right font-medium">
                              ${(d.actual_amount || d.scheduled_amount).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge variant={dConfig.variant}>{dConfig.label}</Badge>
                              {d.hold_reason && (
                                <p className="text-xs text-muted-foreground mt-1">{d.hold_reason}</p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {d.status === "scheduled" && (
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReleaseDisbursement(d.id)}
                                    disabled={isPending}
                                    className="text-xs"
                                  >
                                    Release
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowHoldDialog(d.id)}
                                    disabled={isPending}
                                    className="text-xs"
                                  >
                                    Hold
                                  </Button>
                                </div>
                              )}
                              {d.status === "pending_release" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReleaseDisbursement(d.id)}
                                  disabled={isPending}
                                  className="text-xs"
                                >
                                  Release
                                </Button>
                              )}
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
        </TabsContent>

        {/* ── Account Ledger Tab ── */}
        <TabsContent value="ledger">
          <div className="space-y-6">
            {/* Account Summary */}
            {account && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xl font-bold text-foreground">${account.total_charges.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Charges</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xl font-bold text-green-500">${account.total_payments.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Payments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xl font-bold text-blue-500">${account.total_aid_posted.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Aid Posted</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className={`text-xl font-bold ${account.current_balance > 0 ? "text-red-500" : "text-green-500"}`}>
                      ${Math.abs(account.current_balance).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account.current_balance > 0 ? "Balance Due" : "Credit"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charges */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Charges</CardTitle>
                <Button size="sm" onClick={() => setShowChargeDialog(true)} disabled={!account}>
                  Add Charge
                </Button>
              </CardHeader>
              <CardContent>
                {charges.length === 0 ? (
                  <p className="text-center py-4 text-sm text-muted-foreground">No charges</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Description</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {charges.map((c) => (
                          <tr key={c.id} className={`hover:bg-muted/50 ${c.is_voided ? "opacity-50 line-through" : ""}`}>
                            <td className="py-2 px-3 text-sm">{new Date(c.charge_date).toLocaleDateString()}</td>
                            <td className="py-2 px-3 text-sm capitalize">{c.charge_type.replace(/_/g, " ")}</td>
                            <td className="py-2 px-3 text-sm">{c.description}</td>
                            <td className="py-2 px-3 text-sm text-right font-medium">${c.amount.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right">
                              {!c.is_voided && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setShowVoidDialog(c.id)}
                                  className="text-xs text-red-500"
                                >
                                  Void
                                </Button>
                              )}
                              {c.is_voided && c.voided_reason && (
                                <span className="text-xs text-muted-foreground">{c.voided_reason}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Payments</CardTitle>
                <Button size="sm" onClick={() => setShowPaymentDialog(true)} disabled={!account}>
                  Record Payment
                </Button>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-center py-4 text-sm text-muted-foreground">No payments</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Method</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/50">
                            <td className="py-2 px-3 text-sm">{new Date(p.payment_date).toLocaleDateString()}</td>
                            <td className="py-2 px-3 text-sm capitalize">{p.payment_method.replace(/_/g, " ")}</td>
                            <td className="py-2 px-3 text-sm text-right font-medium text-green-500">
                              {p.is_refund ? "-" : ""}${p.amount.toLocaleString()}
                            </td>
                            <td className="py-2 px-3">
                              <Badge variant={p.status === "completed" ? "default" : "outline"} className="capitalize">
                                {p.status}
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
        </TabsContent>
      </Tabs>

      {/* ── Add Award Dialog ── */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Award</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Award Type</label>
              <select
                value={awardType}
                onChange={(e) => {
                  setAwardType(e.target.value);
                  const names: Record<string, string> = {
                    pell_grant: "Federal Pell Grant",
                    direct_sub: "Direct Subsidized Loan",
                    direct_unsub: "Direct Unsubsidized Loan",
                    fseog: "FSEOG",
                    state_grant: "State Grant",
                    institutional: "Institutional Aid",
                    scholarship: "Scholarship",
                  };
                  setAwardName(names[e.target.value] || e.target.value);
                }}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="pell_grant">Federal Pell Grant</option>
                <option value="direct_sub">Direct Subsidized Loan</option>
                <option value="direct_unsub">Direct Unsubsidized Loan</option>
                <option value="fseog">FSEOG</option>
                <option value="state_grant">State Grant</option>
                <option value="institutional">Institutional Aid</option>
                <option value="scholarship">Scholarship</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Award Name</label>
              <input
                type="text"
                value={awardName}
                onChange={(e) => setAwardName(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Offered Amount ($)</label>
              <input
                type="number"
                value={awardAmount}
                onChange={(e) => setAwardAmount(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAwardDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAward} isLoading={isPending}>Add Award</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Schedule Disbursement Dialog ── */}
      <Dialog open={showDisbursementDialog} onOpenChange={setShowDisbursementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Disbursement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Award</label>
              <select
                value={disbAwardId}
                onChange={(e) => setDisbAwardId(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {awards.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.award_name} (${a.offered_amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Scheduled Date</label>
              <input
                type="date"
                value={disbDate}
                onChange={(e) => setDisbDate(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Amount ($)</label>
              <input
                type="number"
                value={disbAmount}
                onChange={(e) => setDisbAmount(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisbursementDialog(false)}>Cancel</Button>
            <Button onClick={handleScheduleDisbursement} isLoading={isPending}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Hold Disbursement Dialog ── */}
      <Dialog open={!!showHoldDialog} onOpenChange={() => setShowHoldDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Hold on Disbursement</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium text-foreground">Hold Reason</label>
            <textarea
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              rows={3}
              className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Reason for placing hold..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHoldDialog(null)}>Cancel</Button>
            <Button onClick={handleHoldDisbursement} isLoading={isPending}>Place Hold</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Charge Dialog ── */}
      <Dialog open={showChargeDialog} onOpenChange={setShowChargeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Charge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Charge Type</label>
              <select
                value={chargeType}
                onChange={(e) => setChargeType(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="tuition">Tuition</option>
                <option value="fees">Fees</option>
                <option value="books">Books & Supplies</option>
                <option value="equipment">Equipment</option>
                <option value="late_fee">Late Fee</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <input
                type="text"
                value={chargeDesc}
                onChange={(e) => setChargeDesc(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="e.g., Fall 2025 Tuition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Amount ($)</label>
              <input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChargeDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCharge} isLoading={isPending}>Add Charge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Void Charge Dialog ── */}
      <Dialog open={!!showVoidDialog} onOpenChange={() => setShowVoidDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Charge</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium text-foreground">Reason for Voiding</label>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              rows={3}
              className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Reason for voiding this charge..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleVoidCharge} isLoading={isPending}>Void Charge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Record Payment Dialog ── */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="ach">ACH Transfer</option>
                <option value="money_order">Money Order</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Amount ($)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPayment} isLoading={isPending}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
