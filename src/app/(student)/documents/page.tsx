import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { getDocumentChecklist, getStudentDocuments } from "@/lib/actions/student-documents";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, Clock, AlertCircle, Upload } from "lucide-react";
import { DocumentUploader } from "./document-uploader";

export const metadata = {
  title: "Documents | Student Portal",
  description: "Upload and manage your required documents",
};

function getStatusBadge(status: string | null) {
  if (!status) {
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        Not Uploaded
      </Badge>
    );
  }

  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle; label: string }> = {
    uploaded: { variant: "outline", icon: Clock, label: "Under Review" },
    under_review: { variant: "outline", icon: Clock, label: "Under Review" },
    approved: { variant: "default", icon: CheckCircle, label: "Approved" },
    rejected: { variant: "destructive", icon: AlertCircle, label: "Rejected" },
  };

  const { variant, icon: Icon, label } = config[status] || { variant: "outline" as const, icon: Clock, label: status };

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

export default async function DocumentsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  // Get student record
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">Upload and manage your required documents</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Not Yet Enrolled</h3>
              <p className="text-muted-foreground">
                Complete your application and enrollment to access document uploads.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { checklist, completedCount, totalRequired } = await getDocumentChecklist(student.id);
  const { documents } = await getStudentDocuments(student.id);
  const progressPercent = totalRequired > 0 ? (completedCount / totalRequired) * 100 : 0;

  // Group documents by category
  const categories = [...new Set(checklist.map((d) => d.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground">Upload and manage your required documents</p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Completion
          </CardTitle>
          <CardDescription>
            {completedCount} of {totalRequired} required documents approved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          {progressPercent === 100 && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">All required documents are complete!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Categories */}
      {categories.map((category) => {
        const categoryDocs = checklist.filter((d) => d.category === category);

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category} Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryDocs.map((docType) => {
                  const uploadedDoc = documents.find(
                    (d) => (d.document_type as { id?: string })?.id === docType.id
                  );

                  return (
                    <div
                      key={docType.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            docType.uploadStatus === "approved"
                              ? "bg-green-500/20"
                              : docType.uploaded
                              ? "bg-yellow-500/20"
                              : "bg-muted"
                          }`}
                        >
                          {docType.uploadStatus === "approved" ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : docType.uploaded ? (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{docType.name}</h4>
                          {docType.description && (
                            <p className="text-sm text-muted-foreground">{docType.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(docType.uploadStatus)}
                            {docType.is_required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!docType.uploaded && (
                          <DocumentUploader
                            studentId={student.id}
                            documentTypeId={docType.id}
                            documentTypeName={docType.name}
                            allowedTypes={docType.file_types_allowed}
                            maxSizeMb={docType.max_file_size_mb}
                          />
                        )}
                        {uploadedDoc && (
                          <span className="text-xs text-muted-foreground">
                            {(uploadedDoc as { file_name?: string }).file_name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
