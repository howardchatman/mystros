"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import { logAudit } from "@/lib/actions/audit";

type CampusInsert = Database["public"]["Tables"]["campuses"]["Insert"];
type CampusUpdate = Database["public"]["Tables"]["campuses"]["Update"];
type ProgramInsert = Database["public"]["Tables"]["programs"]["Insert"];
type ProgramUpdate = Database["public"]["Tables"]["programs"]["Update"];
type ScheduleInsert = Database["public"]["Tables"]["program_schedules"]["Insert"];
type ScheduleUpdate = Database["public"]["Tables"]["program_schedules"]["Update"];
type DocTypeInsert = Database["public"]["Tables"]["document_types"]["Insert"];
type DocTypeUpdate = Database["public"]["Tables"]["document_types"]["Update"];

const SETTINGS_PATH = "/admin/settings";

// ─── Campuses ───────────────────────────────────────────────────

export async function createCampus(data: Omit<CampusInsert, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient();
  const { data: campus, error } = await supabase
    .from("campuses")
    .insert(data)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "campuses", record_id: campus.id, action: "create", new_data: data as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  return { data: campus };
}

export async function updateCampus(id: string, updates: CampusUpdate) {
  const supabase = await createClient();
  const { data: campus, error } = await supabase
    .from("campuses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "campuses", record_id: id, action: "update", new_data: updates as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  return { data: campus };
}

export async function toggleCampusActive(id: string, isActive: boolean) {
  return updateCampus(id, { is_active: isActive });
}

// ─── Programs ───────────────────────────────────────────────────

export async function createProgram(data: Omit<ProgramInsert, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient();
  const { data: program, error } = await supabase
    .from("programs")
    .insert(data)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "programs", record_id: program.id, action: "create", new_data: data as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  return { data: program };
}

export async function updateProgram(id: string, updates: ProgramUpdate) {
  const supabase = await createClient();
  const { data: program, error } = await supabase
    .from("programs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "programs", record_id: id, action: "update", new_data: updates as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  return { data: program };
}

export async function toggleProgramActive(id: string, isActive: boolean) {
  return updateProgram(id, { is_active: isActive });
}

// ─── Program Schedules ──────────────────────────────────────────

export async function createProgramSchedule(data: Omit<ScheduleInsert, "id" | "created_at">) {
  const supabase = await createClient();
  const { data: schedule, error } = await supabase
    .from("program_schedules")
    .insert(data)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "program_schedules", record_id: schedule.id, action: "create", new_data: data as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  revalidatePath("/admin/scheduling");
  return { data: schedule };
}

export async function updateProgramSchedule(id: string, updates: ScheduleUpdate) {
  const supabase = await createClient();
  const { data: schedule, error } = await supabase
    .from("program_schedules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "program_schedules", record_id: id, action: "update", new_data: updates as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  revalidatePath("/admin/scheduling");
  return { data: schedule };
}

export async function deleteProgramSchedule(id: string) {
  return updateProgramSchedule(id, { is_active: false });
}

// ─── Document Types ─────────────────────────────────────────────

export async function createDocumentType(data: Omit<DocTypeInsert, "id" | "created_at">) {
  const supabase = await createClient();
  const { data: docType, error } = await supabase
    .from("document_types")
    .insert(data)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "document_types", record_id: docType.id, action: "create", new_data: data as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  return { data: docType };
}

export async function updateDocumentType(id: string, updates: DocTypeUpdate) {
  const supabase = await createClient();
  const { data: docType, error } = await supabase
    .from("document_types")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  logAudit({ table_name: "document_types", record_id: id, action: "update", new_data: updates as Record<string, unknown> }).catch(() => {});
  revalidatePath(SETTINGS_PATH);
  return { data: docType };
}

export async function toggleDocumentTypeActive(id: string, isActive: boolean) {
  return updateDocumentType(id, { is_active: isActive });
}
