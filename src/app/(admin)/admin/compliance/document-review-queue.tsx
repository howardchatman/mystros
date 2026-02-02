"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { approveDocument, rejectDocument } from "@/lib/actions/document-review";

interface PendingDocument {
  id: string;
  file_name: string;
  file_path: string | null;
  status: string;
  created_at: string;
  student_id: string;
  student: any;
  document_type: any;
}

interface Props {
  documents: PendingDocument[];
}

export function DocumentReviewQueue({ documents }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectDialogDoc, setRejectDialogDoc] = useState<PendingDocument | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const getStudentName = (doc: PendingDocument) => {
    const s = doc.student as { first_name?: string; last_name?: string; student_number?: string } | { first_name?: string; last_name?: string; student_number?: string }[] | null;
    const student = Array.isArray(s) ? s[0] : s;
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  const getStudentNumber = (doc: PendingDocument) => {
    const s = doc.student as { student_number?: string } | { student_number?: string }[] | null;
    const student = Array.isArray(s) ? s[0] : s;
    return student?.student_number || "";
  };

  const getDocTypeName = (doc: PendingDocument) => {
    const dt = doc.document_type as { name?: string; category?: string } | { name?: string; category?: string }[] | null;
    const type = Array.isArray(dt) ? dt[0] : dt;
    return type?.name || "Unknown";
  };

  const getDocCategory = (doc: PendingDocument) => {
    const dt = doc.document_type as { category?: string } | { category?: string }[] | null;
    const type = Array.isArray(dt) ? dt[0] : dt;
    return type?.category || "";
  };

  const handleApprove = (docId: string) => {
    setActionId(docId);
    startTransition(async () => {
      const result = await approveDocument(docId);
      if (result.error) alert(result.error);
      setActionId(null);
      router.refresh();
    });
  };

  const handleReject = () => {
    if (!rejectDialogDoc || !rejectReason.trim()) return;
    const docId = rejectDialogDoc.id;
    setActionId(docId);
    startTransition(async () => {
      const result = await rejectDocument(docId, rejectReason.trim());
      if (result.error) alert(result.error);
      setRejectDialogDoc(null);
      setRejectReason("");
      setActionId(null);
      router.refresh();
    });
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">No documents pending review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Review Queue
            <Badge variant="secondary">{documents.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Uploaded</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground text-sm">{getStudentName(doc)}</p>
                      <p className="text-xs text-muted-foreground font-mono">{getStudentNumber(doc)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{getDocTypeName(doc)}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.file_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize text-xs">{getDocCategory(doc)}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {doc.file_path && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(doc.file_path!, "_blank")}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(doc.id)}
                          isLoading={isPending && actionId === doc.id}
                          disabled={isPending}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectDialogDoc(doc);
                            setRejectReason("");
                          }}
                          disabled={isPending}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialogDoc} onOpenChange={(open) => !open && setRejectDialogDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Rejecting: {rejectDialogDoc ? getDocTypeName(rejectDialogDoc) : ""} from {rejectDialogDoc ? getStudentName(rejectDialogDoc) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Reason for rejection</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please explain why this document is being rejected..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogDoc(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                isLoading={isPending}
                disabled={isPending || !rejectReason.trim()}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
