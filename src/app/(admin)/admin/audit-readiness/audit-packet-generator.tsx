"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateStudentAuditPacket } from "@/lib/actions/audit-readiness";

interface AuditPacketGeneratorProps {
  studentId: string;
  studentNumber: string;
  label?: string;
}

export function AuditPacketGenerator({ studentId, studentNumber, label }: AuditPacketGeneratorProps) {
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateStudentAuditPacket(studentId);
      if (result.error || !result.data) return;

      const dateStr = new Date().toISOString().split("T")[0];
      const prefix = `audit-${studentNumber}-${dateStr}`;

      // Try JSZip if available, otherwise download individual CSVs
      try {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        Object.entries(result.data.files).forEach(([filename, csv]) => {
          zip.file(filename, csv);
        });
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${prefix}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // Fallback: download each CSV separately
        Object.entries(result.data.files).forEach(([filename, csv]) => {
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${prefix}-${filename}`;
          a.click();
          URL.revokeObjectURL(url);
        });
      }
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isPending}>
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Download className="w-4 h-4" />
          {label && <span className="ml-1">{label}</span>}
        </>
      )}
    </Button>
  );
}
