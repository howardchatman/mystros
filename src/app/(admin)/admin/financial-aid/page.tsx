import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Users, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { BatchDisbursements } from "./batch-disbursements";

export const metadata = {
  title: "Financial Aid | Admin Dashboard",
  description: "Manage student financial aid records",
};

function getStatusBadge(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "outline", label: "Pending" },
    submitted: { variant: "secondary", label: "Submitted" },
    isir_received: { variant: "secondary", label: "ISIR Received" },
    verification_required: { variant: "outline", label: "Verification Required" },
    verified: { variant: "default", label: "Verified" },
    packaged: { variant: "default", label: "Packaged" },
    accepted: { variant: "default", label: "Accepted" },
    declined: { variant: "destructive", label: "Declined" },
  };
  const { variant, label } = config[status] || { variant: "outline" as const, label: status?.replace(/_/g, " ") || "Unknown" };
  return <Badge variant={variant} className="capitalize">{label}</Badge>;
}

export default async function FinancialAidPage() {
  const supabase = await createClient();

  // Get all financial aid records with student info
  const { data: aidRecords } = await supabase
    .from("financial_aid_records")
    .select(`
      *,
      student:students(
        id,
        first_name,
        last_name,
        student_number,
        program:programs(name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get total outstanding balances
  const { data: accounts } = await supabase
    .from("student_accounts")
    .select("current_balance");

  const totalOutstanding = (accounts || []).reduce(
    (sum, a) => sum + (a.current_balance || 0),
    0
  );

  // Get pending disbursements for batch release
  const { data: pendingDisbursements } = await supabase
    .from("disbursements")
    .select(`
      id, amount, scheduled_date, status,
      student:students(first_name, last_name, student_number),
      award:financial_aid_awards(award_type, award_name)
    `)
    .in("status", ["scheduled", "pending"])
    .order("scheduled_date", { ascending: true });

  // Get recent disbursements
  const { data: recentDisbursements } = await supabase
    .from("disbursements")
    .select(`
      *,
      student:students(first_name, last_name, student_number),
      award:financial_aid_awards(award_type, award_name)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  const records = aidRecords || [];
  const pendingCount = records.filter((r) => ["pending", "submitted", "isir_received", "verification_required"].includes(r.status)).length;
  const packagedCount = records.filter((r) => ["packaged", "accepted"].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Financial Aid</h1>
        <p className="text-muted-foreground">Manage student financial aid records and disbursements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-brand-accent/10">
                <Users className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{records.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{packagedCount}</p>
                <p className="text-sm text-muted-foreground">Packaged/Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/10">
                <DollarSign className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Aid Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Financial Aid Records
          </CardTitle>
          <Link href="/admin/financial-aid/create">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Create Record
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Financial Aid Records</h3>
              <p className="text-muted-foreground">Financial aid records will appear here once students apply.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Academic Year</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">FAFSA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">EFC</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const student = record.student as { first_name?: string; last_name?: string; student_number?: string; program?: { name?: string } | { name?: string }[] } | null;
                    return (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Link href={`/admin/financial-aid/${record.id}`} className="block">
                            <p className="font-medium text-foreground hover:text-brand-accent transition-colors">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{student?.student_number || "—"}</p>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">{record.academic_year || "—"}</td>
                        <td className="py-3 px-4 text-sm">
                          {record.fafsa_submitted ? (
                            <Badge variant="default">Submitted</Badge>
                          ) : (
                            <Badge variant="outline">Not Submitted</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                        <td className="py-3 px-4 text-sm">
                          {record.efc != null ? `$${Number(record.efc).toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {record.verification_required ? (
                            <Badge variant={record.verification_completed ? "default" : "secondary"}>
                              {record.verification_completed ? "Complete" : "Required"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
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

      {/* Batch Disbursements */}
      <BatchDisbursements disbursements={(pendingDisbursements || []) as any[]} />

      {/* Recent Disbursements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recent Disbursements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recentDisbursements || recentDisbursements.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No disbursements recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Award</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDisbursements.map((d) => {
                    const student = d.student as { first_name?: string; last_name?: string; student_number?: string } | null;
                    const award = d.award as { award_type?: string; award_name?: string } | null;
                    return (
                      <tr key={d.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm font-medium">
                          {student?.first_name} {student?.last_name}
                        </td>
                        <td className="py-3 px-4 text-sm">{award?.award_name || award?.award_type || "—"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={d.status === "disbursed" ? "default" : "outline"} className="capitalize">
                            {d.status?.replace(/_/g, " ") || "—"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ${Number(d.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
