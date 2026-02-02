"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface DocumentRow {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  document_type: { name: string; category: string; is_required: boolean } | null;
}

interface StudentDocumentsSectionProps {
  documents: DocumentRow[];
}

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_review: { label: "Pending Review", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "secondary" },
};

export function StudentDocumentsSection({ documents }: StudentDocumentsSectionProps) {
  // Group documents by category
  const grouped = documents.reduce<Record<string, DocumentRow[]>>((acc, doc) => {
    const category = doc.document_type?.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No documents uploaded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {(grouped[category] ?? []).map((doc) => {
                const sb = statusBadge[doc.status] || { label: doc.status, variant: "outline" as const };
                return (
                  <div key={doc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {doc.document_type?.name || doc.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.file_name} · {new Date(doc.created_at).toLocaleDateString()}
                          {doc.document_type?.is_required && (
                            <span className="text-destructive ml-1">Required</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge variant={sb.variant}>{sb.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
