"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, File, X } from "lucide-react";
import { uploadDocument } from "@/lib/actions/student-documents";
import { toast } from "sonner";

interface DocumentUploaderProps {
  studentId: string;
  documentTypeId: string;
  documentTypeName: string;
  allowedTypes: string[];
  maxSizeMb: number;
}

export function DocumentUploader({
  studentId,
  documentTypeId,
  documentTypeName,
  allowedTypes,
  maxSizeMb,
}: DocumentUploaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = allowedTypes.map((t) => `.${t}`).join(",");
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(ext || "")) {
      toast.error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      toast.error(`File too large. Maximum size: ${maxSizeMb}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    startTransition(async () => {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        const result = await uploadDocument(
          studentId,
          documentTypeId,
          selectedFile.name,
          base64
        );

        if (result.success) {
          toast.success(`${documentTypeName} uploaded successfully`);
          setSelectedFile(null);
          setShowUploader(false);
          router.refresh();
        } else {
          toast.error(result.error || "Upload failed");
        }
      };
      reader.readAsDataURL(selectedFile);
    });
  };

  if (!showUploader) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowUploader(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Upload
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {selectedFile ? (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
            <File className="w-4 h-4" />
            <span className="max-w-[120px] truncate">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" onClick={handleUpload} disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Upload"
            )}
          </Button>
        </>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Select File
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUploader(false)}
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
