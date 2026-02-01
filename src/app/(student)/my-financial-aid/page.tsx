import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Financial Aid | Student Portal",
  description: "View your financial aid status and awards",
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

export default async function StudentFinancialAidPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get student record
  const { data: student } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Financial Aid</h1>
          <p className="text-muted-foreground">View your financial aid status</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Not Yet Enrolled</h3>
              <p className="text-muted-foreground">
                Complete your enrollment to view financial aid information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get financial aid records
  const { data: aidRecords } = await supabase
    .from("financial_aid_records")
    .select("*")
    .eq("student_id", student.id)
    .order("academic_year", { ascending: false });

  // Get awards
  const { data: awards } = await supabase
    .from("financial_aid_awards")
    .select("*")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  // Get disbursements
  const { data: disbursements } = await supabase
    .from("disbursements")
    .select("*, award:financial_aid_awards(award_type, award_name)")
    .eq("student_id", student.id)
    .order("scheduled_date", { ascending: false });

  // Get account balance
  const { data: account } = await supabase
    .from("student_accounts")
    .select("*")
    .eq("student_id", student.id)
    .single();

  const currentRecord = aidRecords?.[0];
  const totalAwarded = (awards || []).reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalDisbursed = (disbursements || []).filter((d) => d.status === "disbursed").reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Financial Aid</h1>
        <p className="text-muted-foreground">View your financial aid status and awards</p>
      </div>

      {/* Account Balance */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Account Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">
                  ${Number(account.total_charges || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Charges</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-green-500">
                  ${Number(account.total_payments || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Payments</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-blue-500">
                  ${Number(account.total_aid_applied || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Aid Applied</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className={`text-2xl font-bold ${(account.current_balance || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                  ${Number(account.current_balance || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Current Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAFSA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            FAFSA Status
          </CardTitle>
          <CardDescription>
            {currentRecord ? `Academic Year: ${currentRecord.academic_year}` : "No financial aid application on file"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentRecord ? (
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No FAFSA application found. Contact the financial aid office if you have submitted your FAFSA.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {currentRecord.fafsa_submitted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-foreground">FAFSA Submitted</span>
                </div>
                <Badge variant={currentRecord.fafsa_submitted ? "default" : "outline"}>
                  {currentRecord.fafsa_submitted ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <span className="text-foreground">Application Status</span>
                {getStatusBadge(currentRecord.status)}
              </div>
              {currentRecord.verification_required && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <span className="text-foreground">Verification</span>
                  <Badge variant={currentRecord.verification_completed ? "default" : "secondary"}>
                    {currentRecord.verification_completed ? "Complete" : "Required"}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Awards */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Aid Awards</CardTitle>
          <CardDescription>
            Total Awarded: ${totalAwarded.toLocaleString()} | Total Disbursed: ${totalDisbursed.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!awards || awards.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No awards on file yet.</p>
          ) : (
            <div className="space-y-3">
              {awards.map((award) => (
                <div key={award.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">{award.award_name || award.award_type}</p>
                    <p className="text-sm text-muted-foreground capitalize">{award.award_type?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${Number(award.amount || 0).toLocaleString()}</p>
                    <Badge variant={award.status === "accepted" ? "default" : "outline"} className="capitalize">
                      {award.status?.replace(/_/g, " ") || "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disbursements */}
      <Card>
        <CardHeader>
          <CardTitle>Disbursement Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {!disbursements || disbursements.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No disbursements scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Award</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursements.map((d) => {
                    const award = d.award as { award_type?: string; award_name?: string } | null;
                    return (
                      <tr key={d.id} className="border-b border-border">
                        <td className="py-3 px-4 text-sm">
                          {d.scheduled_date
                            ? new Date(d.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-sm">{award?.award_name || award?.award_type || "—"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={d.status === "disbursed" ? "default" : "outline"} className="capitalize">
                            {d.status?.replace(/_/g, " ") || "Pending"}
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
