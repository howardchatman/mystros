"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";
import { sendDocumentRejectionEmail } from "@/lib/actions/email";

// ─── Get Pending Documents ───────────────────────────────

export async function getPendingDocuments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select(`
      id,
      file_name,
      file_path,
      status,
      created_at,
      student_id,
      student:students(id, first_name, last_name, student_number, campus_id),
      document_type:document_types(name, category)
    `)
    .in("status", ["uploaded", "under_review"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getPendingDocuments] error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Approve Document ────────────────────────────────────

export async function approveDocument(documentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: oldDoc } = await supabase
    .from("documents")
    .select("status")
    .eq("id", documentId)
    .single();

  const { error } = await supabase
    .from("documents")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (error) return { error: error.message };

  logAudit({
    table_name: "documents",
    record_id: documentId,
    action: "status_change",
    old_data: oldDoc ? { status: oldDoc.status } : undefined,
    new_data: { status: "approved" },
  }).catch(() => {});

  revalidatePath("/admin/compliance");
  return { success: true };
}

// ─── Reject Document ─────────────────────────────────────

export async function rejectDocument(documentId: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: oldDoc } = await supabase
    .from("documents")
    .select("status")
    .eq("id", documentId)
    .single();

  const { data, error } = await supabase
    .from("documents")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reason,
    })
    .eq("id", documentId)
    .select(`
      student_id,
      document_type:document_types(name)
    `)
    .single();

  if (error) return { error: error.message };

  logAudit({
    table_name: "documents",
    record_id: documentId,
    action: "status_change",
    old_data: oldDoc ? { status: oldDoc.status } : undefined,
    new_data: { status: "rejected", reason },
  }).catch(() => {});

  // Send rejection email
  if (data?.student_id) {
    const docType = data.document_type as { name?: string } | { name?: string }[] | null;
    const typeName = Array.isArray(docType) ? docType[0]?.name : docType?.name;
    if (typeName) {
      sendDocumentRejectionEmail(data.student_id, typeName, reason).catch(() => {});
    }
  }

  revalidatePath("/admin/compliance");
  return { success: true };
}
