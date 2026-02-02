import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, FileText, Users, AlertCircle, CheckCircle } from "lucide-react";
import { getPendingDocuments } from "@/lib/actions/document-review";
import { getAuditLogs } from "@/lib/actions/audit";
import { DocumentReviewQueue } from "./document-review-queue";
import { AuditLogViewer } from "./audit-log-viewer";

export const metadata = {
  title: "Compliance | Admin Dashboard",
  description: "Monitor regulatory compliance and document status",
};

export default async function CompliancePage() {
  const supabase = await createClient();
  const pendingDocs = await getPendingDocuments();

  // Get all active students with document counts
  const { data: students } = await supabase
    .from("students")
    .select(`
      id,
      first_name,
      last_name,
      student_number,
      status,
      program:programs(name)
    `)
    .in("status", ["active", "enrolled"])
    .order("last_name");

  // Get document types (required docs)
  const { data: documentTypes } = await supabase
    .from("document_types")
    .select("*")
    .eq("is_required", true)
    .eq("is_active", true);

  // Get all student documents
  const { data: allDocuments } = await supabase
    .from("documents")
    .select("student_id, status, document_type_id");

  // Get audit logs (paginated)
  const auditResult = await getAuditLogs({ page: 1, limit: 50 });

  const requiredDocCount = documentTypes?.length || 0;
  const activeStudents = students || [];
  const docs = allDocuments || [];

  // Calculate per-student compliance
  const studentCompliance = activeStudents.map((student) => {
    const studentDocs = docs.filter((d) => d.student_id === student.id);
    const approvedDocs = studentDocs.filter((d) => d.status === "approved");
    const pendingDocs = studentDocs.filter((d) => ["uploaded", "under_review"].includes(d.status || ""));
    const missingCount = Math.max(0, requiredDocCount - studentDocs.length);
    const compliancePercent = requiredDocCount > 0
      ? Math.round((approvedDocs.length / requiredDocCount) * 100)
      : 100;
    return {
      ...student,
      approvedCount: approvedDocs.length,
      pendingCount: pendingDocs.length,
      missingCount,
      compliancePercent,
    };
  });

  const fullyCompliant = studentCompliance.filter((s) => s.compliancePercent === 100).length;
  const nonCompliant = studentCompliance.filter((s) => s.compliancePercent < 100).length;
  const overallRate = activeStudents.length > 0
    ? Math.round((fullyCompliant / activeStudents.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Compliance</h1>
        <p className="text-muted-foreground">Monitor regulatory compliance and document status</p>
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
                <p className="text-2xl font-bold text-foreground">{activeStudents.length}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{fullyCompliant}</p>
                <p className="text-sm text-muted-foreground">Fully Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{nonCompliant}</p>
                <p className="text-sm text-muted-foreground">Non-Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{overallRate}%</p>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Review Queue */}
      <DocumentReviewQueue documents={pendingDocs} />

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Required Documents ({requiredDocCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!documentTypes || documentTypes.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No required document types configured.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documentTypes.map((dt) => (
                <div key={dt.id} className="p-3 rounded-lg border border-border bg-card">
                  <p className="font-medium text-foreground text-sm">{dt.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{dt.category}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Student Document Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentCompliance.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No active students found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Approved</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pending</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Missing</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {studentCompliance.map((student) => {
                    const program = student.program as { name?: string } | { name?: string }[] | null;
                    const programName = Array.isArray(program) ? program[0]?.name : program?.name;
                    return (
                      <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{student.student_number}</p>
                        </td>
                        <td className="py-3 px-4 text-sm">{programName || "—"}</td>
                        <td className="py-3 px-4">
                          <span className="text-green-500 font-medium">{student.approvedCount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-yellow-500 font-medium">{student.pendingCount}</span>
                        </td>
                        <td className="py-3 px-4">
                          {student.missingCount > 0 ? (
                            <span className="text-red-500 font-medium">{student.missingCount}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={student.compliancePercent} className="h-2 w-20" />
                            <span className="text-sm font-medium">{student.compliancePercent}%</span>
                          </div>
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

      {/* Audit Log */}
      <AuditLogViewer
        initialLogs={auditResult.data?.logs || []}
        initialTotal={auditResult.data?.total || 0}
      />
    </div>
  );
}
