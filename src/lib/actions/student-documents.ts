"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get all document types
 */
export async function getDocumentTypes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("document_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    return { documentTypes: [], error: error.message };
  }

  return { documentTypes: data || [] };
}

/**
 * Get student documents with their types
 */
export async function getStudentDocuments(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      document_type:document_types(*)
    `
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    return { documents: [], error: error.message };
  }

  return { documents: data || [] };
}

/**
 * Get document checklist for a student (what's required vs uploaded)
 */
export async function getDocumentChecklist(studentId: string) {
  const supabase = await createClient();

  // Get all required document types
  const { data: documentTypes } = await supabase
    .from("document_types")
    .select("*")
    .eq("is_active", true)
    .eq("is_required", true)
    .order("sort_order");

  // Get student's uploaded documents
  const { data: uploadedDocs } = await supabase
    .from("documents")
    .select("document_type_id, status")
    .eq("student_id", studentId);

  // Create checklist with status
  const checklist = (documentTypes || []).map((docType) => {
    const uploaded = uploadedDocs?.find((d) => d.document_type_id === docType.id);
    return {
      ...docType,
      uploaded: !!uploaded,
      uploadStatus: uploaded?.status || null,
    };
  });

  const completedCount = checklist.filter((d) => d.uploaded && d.uploadStatus === "approved").length;
  const totalRequired = checklist.length;

  return {
    checklist,
    completedCount,
    totalRequired,
    isComplete: completedCount === totalRequired,
  };
}

/**
 * Upload a document
 */
export async function uploadDocument(
  studentId: string,
  documentTypeId: string,
  fileName: string,
  fileData: string // base64 encoded
) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Create file path
  const fileExt = fileName.split(".").pop();
  const filePath = `${studentId}/${documentTypeId}/${Date.now()}.${fileExt}`;

  // Decode base64 and upload to storage
  const base64Data = fileData.split(",")[1] || fileData;
  const buffer = Buffer.from(base64Data, "base64");

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, buffer, {
      contentType: `application/${fileExt}`,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { success: false, error: "Failed to upload file" };
  }

  // Create document record
  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({
      student_id: studentId,
      document_type_id: documentTypeId,
      file_name: fileName,
      file_path: filePath,
      file_size: buffer.length,
      status: "uploaded",
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Document insert error:", insertError);
    // Try to clean up the uploaded file
    await supabase.storage.from("documents").remove([filePath]);
    return { success: false, error: "Failed to save document record" };
  }

  revalidatePath("/dashboard/documents");
  revalidatePath("/documents");

  return { success: true, document };
}

/**
 * Get download URL for a document
 */
export async function getDocumentDownloadUrl(documentId: string) {
  const supabase = await createClient();

  // Get document record
  const { data: document, error } = await supabase
    .from("documents")
    .select("file_path, file_name")
    .eq("id", documentId)
    .single();

  if (error || !document) {
    return { url: null, error: "Document not found" };
  }

  // Get signed URL
  const { data: urlData, error: urlError } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.file_path, 60 * 5); // 5 minutes

  if (urlError) {
    return { url: null, error: "Failed to generate download URL" };
  }

  return { url: urlData.signedUrl, fileName: document.file_name };
}
