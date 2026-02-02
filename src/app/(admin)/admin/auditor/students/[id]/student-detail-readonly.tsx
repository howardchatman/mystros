"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, FileText, Clock, TrendingUp, DollarSign } from "lucide-react";
import { AuditPacketGenerator } from "@/app/(admin)/admin/audit-readiness/audit-packet-generator";

interface StudentDetailReadonlyProps {
  student: any;
  sapHistory: any;
  documents: any[];
  account: any;
  attendance: any[];
  charges: any[];
  payments: any[];
  aidRecords: any[];
  disbursements: any[];
}

const tabs = [
  { key: "overview", label: "Overview", icon: User },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "attendance", label: "Attendance", icon: Clock },
  { key: "sap", label: "SAP", icon: TrendingUp },
  { key: "financial", label: "Financial", icon: DollarSign },
] as const;

type Tab = (typeof tabs)[number]["key"];

export function StudentDetailReadonly({
  student,
  sapHistory,
  documents,
  account,
  attendance,
  charges,
  payments,
  aidRecords,
  disbursements,
}: StudentDetailReadonlyProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const program = Array.isArray(student.program) ? student.program[0] : student.program;
  const campus = Array.isArray(student.campus) ? student.campus[0] : student.campus;
  const schedule = Array.isArray(student.schedule) ? student.schedule[0] : student.schedule;
  const programTotal = program?.total_hours || 1500;
  const hoursPercent = Math.min(100, Math.round(((student.total_hours_completed || 0) / programTotal) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/auditor/students")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{student.student_number}</p>
          </div>
          <Badge variant="outline" className="capitalize">{student.status?.replace(/_/g, " ")}</Badge>
        </div>
        <AuditPacketGenerator studentId={student.id} studentNumber={student.student_number} label="Download Packet" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-brand-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Student Information</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-foreground">{student.email}</dd>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="text-foreground">{student.phone || "—"}</dd>
                <dt className="text-muted-foreground">Date of Birth</dt>
                <dd className="text-foreground">{student.date_of_birth || "—"}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd><Badge variant="outline" className="capitalize">{student.status?.replace(/_/g, " ")}</Badge></dd>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Enrollment</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <dt className="text-muted-foreground">Program</dt>
                <dd className="text-foreground">{program?.name || "—"}</dd>
                <dt className="text-muted-foreground">Campus</dt>
                <dd className="text-foreground">{campus?.name || "—"}</dd>
                <dt className="text-muted-foreground">Schedule</dt>
                <dd className="text-foreground">{schedule?.name || "—"}</dd>
                <dt className="text-muted-foreground">Enrollment Date</dt>
                <dd className="text-foreground">{student.enrollment_date || "—"}</dd>
                <dt className="text-muted-foreground">Start Date</dt>
                <dd className="text-foreground">{student.start_date || "—"}</dd>
                <dt className="text-muted-foreground">Expected Graduation</dt>
                <dd className="text-foreground">{student.expected_graduation_date || "—"}</dd>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Hours Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-bold text-foreground">
                    {(student.total_hours_completed || 0).toLocaleString()} / {programTotal.toLocaleString()}
                  </span>
                </div>
                <Progress value={hoursPercent} className="h-3" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Theory</p>
                    <p className="font-medium text-foreground">{(student.theory_hours_completed || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Practical</p>
                    <p className="font-medium text-foreground">{(student.practical_hours_completed || 0).toLocaleString()}</p>
                  </div>
                </div>
                {student.is_transfer_student && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Transfer Hours Accepted</p>
                    <p className="font-medium text-foreground">{student.transfer_hours_accepted || 0}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">SAP Status</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <dt className="text-muted-foreground">Current Status</dt>
                <dd>
                  <Badge
                    variant={student.current_sap_status === "satisfactory" ? "default" : student.current_sap_status === "warning" ? "outline" : "destructive"}
                    className="capitalize"
                  >
                    {(student.current_sap_status || "N/A").replace(/_/g, " ")}
                  </Badge>
                </dd>
                <dt className="text-muted-foreground">Last Evaluation</dt>
                <dd className="text-foreground">{student.last_sap_evaluation_date || "—"}</dd>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "documents" && (
        <Card>
          <CardHeader><CardTitle>Documents ({documents.length})</CardTitle></CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No documents uploaded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Document Type</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Required</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Uploaded</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Reviewed</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((d) => (
                      <tr key={d.id} className="border-b border-border">
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{d.document_type?.name || d.file_name}</td>
                        <td className="py-3 px-4 text-sm capitalize">{d.document_type?.category || "—"}</td>
                        <td className="py-3 px-4 text-sm">{d.document_type?.is_required ? "Yes" : "No"}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={d.status === "approved" ? "default" : d.status === "rejected" ? "destructive" : "outline"}
                            className="capitalize text-xs"
                          >
                            {d.status?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {d.reviewed_at ? new Date(d.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {d.expires_at ? (
                            <span className={new Date(d.expires_at) < new Date() ? "text-red-500 font-medium" : ""}>
                              {new Date(d.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "attendance" && (
        <Card>
          <CardHeader><CardTitle>Attendance Records (Last 100)</CardTitle></CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No attendance records.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Clock In</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Clock Out</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Scheduled</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actual</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Theory</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Practical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="py-3 px-4 text-sm">{a.attendance_date}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={a.status === "present" ? "default" : a.status === "excused" ? "outline" : "destructive"}
                            className="capitalize text-xs"
                          >
                            {a.status?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">{a.clock_in_time || "—"}</td>
                        <td className="py-3 px-4 text-xs font-mono">{a.clock_out_time || "—"}</td>
                        <td className="py-3 px-4 text-right text-sm">{a.scheduled_hours || "—"}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium">{a.actual_hours || "—"}</td>
                        <td className="py-3 px-4 text-right text-sm">{a.theory_hours || "—"}</td>
                        <td className="py-3 px-4 text-right text-sm">{a.practical_hours || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "sap" && (
        <Card>
          <CardHeader><CardTitle>SAP Evaluation History</CardTitle></CardHeader>
          <CardContent>
            {!sapHistory || sapHistory.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No SAP evaluations on record.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Eval Point</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Hours Attempted</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Hours Completed</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Completion Rate</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sapHistory.map((e: any) => (
                      <tr key={e.id} className="border-b border-border">
                        <td className="py-3 px-4 text-sm">{e.evaluation_date}</td>
                        <td className="py-3 px-4 text-sm">{e.evaluation_point}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={e.status === "satisfactory" ? "default" : e.status === "warning" ? "outline" : "destructive"}
                            className="capitalize text-xs"
                          >
                            {e.status?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">{e.hours_attempted}</td>
                        <td className="py-3 px-4 text-right text-sm">{e.hours_completed}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium">{e.completion_rate}%</td>
                        <td className="py-3 px-4">
                          <Badge variant={e.is_within_max_timeframe ? "default" : "destructive"} className="text-xs">
                            {e.is_within_max_timeframe ? "Within" : "Exceeded"}
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
      )}

      {activeTab === "financial" && (
        <div className="space-y-6">
          {/* Account Summary */}
          {account && (
            <Card>
              <CardHeader><CardTitle>Account Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Charges</p>
                    <p className="text-lg font-bold text-foreground">${Number(account.total_charges || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Payments</p>
                    <p className="text-lg font-bold text-foreground">${Number(account.total_payments || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Aid Posted</p>
                    <p className="text-lg font-bold text-foreground">${Number(account.total_aid_posted || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className={`text-lg font-bold ${(account.current_balance || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                      ${Number(account.current_balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Aid */}
          {aidRecords.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Financial Aid Records</CardTitle></CardHeader>
              <CardContent>
                {aidRecords.map((r: any) => (
                  <div key={r.id} className="mb-4 last:mb-0 p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground text-sm">{r.academic_year}</span>
                      <Badge variant="outline" className="capitalize text-xs">{r.status?.replace(/_/g, " ")}</Badge>
                      {r.verification_required && (
                        <Badge variant={r.verification_status === "complete" ? "default" : "destructive"} className="text-xs">
                          Verification: {r.verification_status || "Required"}
                        </Badge>
                      )}
                    </div>
                    {r.awards && r.awards.length > 0 && (
                      <div className="ml-3 space-y-1">
                        {r.awards.map((a: any) => (
                          <div key={a.id} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{a.award_name}</span>
                            <span className="font-medium text-foreground">
                              ${Number(a.accepted_amount || a.offered_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Charges */}
          <Card>
            <CardHeader><CardTitle>Charges ({charges.length})</CardTitle></CardHeader>
            <CardContent>
              {charges.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">No charges.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Description</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((c: any, i: number) => (
                        <tr key={i} className="border-b border-border">
                          <td className="py-2 px-3 text-xs">{c.charge_date}</td>
                          <td className="py-2 px-3 text-xs capitalize">{c.charge_type?.replace(/_/g, " ")}</td>
                          <td className="py-2 px-3 text-xs">{c.description}</td>
                          <td className="py-2 px-3 text-xs text-right font-medium">${Number(c.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 text-xs">{c.is_voided ? <Badge variant="destructive" className="text-[10px]">Voided</Badge> : "Active"}</td>
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
            <CardHeader><CardTitle>Payments ({payments.length})</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">No payments.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Method</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-border">
                          <td className="py-2 px-3 text-xs">{p.payment_date}</td>
                          <td className="py-2 px-3 text-xs capitalize">{p.payment_method?.replace(/_/g, " ")}</td>
                          <td className="py-2 px-3">
                            <Badge
                              variant={p.status === "completed" ? "default" : p.status === "pending" ? "outline" : "destructive"}
                              className="capitalize text-[10px]"
                            >
                              {p.status?.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-right font-medium">
                            {p.is_refund ? "-" : ""}${Number(p.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disbursements */}
          <Card>
            <CardHeader><CardTitle>Disbursements ({disbursements.length})</CardTitle></CardHeader>
            <CardContent>
              {disbursements.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">No disbursements.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Scheduled</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Actual Date</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Actual Amount</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disbursements.map((d: any) => (
                        <tr key={d.id} className="border-b border-border">
                          <td className="py-2 px-3 text-xs">{d.disbursement_number}</td>
                          <td className="py-2 px-3 text-xs">{d.scheduled_date}</td>
                          <td className="py-2 px-3 text-xs text-right">${Number(d.scheduled_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 text-xs">{d.actual_date || "—"}</td>
                          <td className="py-2 px-3 text-xs text-right">{d.actual_amount ? `$${Number(d.actual_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}</td>
                          <td className="py-2 px-3">
                            <Badge variant={d.status === "posted" ? "default" : d.status === "cancelled" || d.status === "returned" ? "destructive" : "outline"} className="capitalize text-[10px]">
                              {d.status?.replace(/_/g, " ")}
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
      )}
    </div>
  );
}
