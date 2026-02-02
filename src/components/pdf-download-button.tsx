"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { generateTranscript, generateCertificate, generateFinancialStatement } from "@/lib/actions/pdf";
import { toast } from "sonner";

interface PdfDownloadButtonProps {
  type: "transcript" | "certificate" | "financial";
  studentId: string;
  label?: string;
  variant?: "primary" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const generators = {
  transcript: generateTranscript,
  certificate: generateCertificate,
  financial: generateFinancialStatement,
};

export function PdfDownloadButton({
  type,
  studentId,
  label,
  variant = "outline",
  size = "sm",
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const defaultLabels = {
    transcript: "Download Transcript",
    certificate: "Download Certificate",
    financial: "Download Financial Statement",
  };

  async function handleDownload() {
    setLoading(true);
    try {
      const result = await generators[type](studentId);

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      if (!result.data) {
        toast.error("Failed to generate PDF");
        return;
      }

      // Convert base64 to blob and trigger download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName || `${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${label || defaultLabels[type]} generated successfully.`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={loading}>
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      {label || defaultLabels[type]}
    </Button>
  );
}
