"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";

export interface CreateLeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  programInterest?: string;
  source?: string;
  sourceDetail?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  retellCallId?: string;
}

export async function createLead(data: CreateLeadData) {
  const supabase = createAdminClient();

  // Check for existing lead with same email
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("email", data.email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return { success: true, leadId: existing.id, isExisting: true };
  }

  // Map program interest to program_id if provided
  let programId: string | null = null;
  if (data.programInterest && data.programInterest !== "not_sure") {
    const programCodeMap: Record<string, string> = {
      class_a_barber: "CLASS_A",
      crossover: "CROSSOVER",
      instructor: "INSTRUCTOR",
    };
    const code = programCodeMap[data.programInterest];
    if (code) {
      const { data: program } = await supabase
        .from("programs")
        .select("id")
        .eq("code", code)
        .maybeSingle();
      programId = program?.id || null;
    }
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      program_id: programId,
      source: data.source || "website",
      source_detail: data.sourceDetail || null,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      retell_call_id: data.retellCallId || null,
      status: "lead",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createLead] error:", error.message);
    return { success: false, error: error.message };
  }

  // Auto-enroll in new_lead_nurture sequence
  await enrollLeadInSequence(lead.id, data.email, data.firstName, "new_lead_nurture");

  logAudit({
    table_name: "leads",
    record_id: lead.id,
    action: "create",
    new_data: { source: data.source, email: data.email },
  }).catch(() => {});

  revalidatePath("/admin/admissions/leads");
  revalidatePath("/admin/enrollment-funnel");

  return { success: true, leadId: lead.id };
}

export async function enrollLeadInSequence(
  leadId: string,
  email: string,
  firstName: string,
  sequenceCode: string
) {
  const supabase = createAdminClient();

  // Get sequence
  const { data: sequence } = await supabase
    .from("email_sequences")
    .select("id")
    .eq("code", sequenceCode)
    .eq("is_active", true)
    .maybeSingle();

  if (!sequence) {
    console.log(`[enrollLeadInSequence] Sequence ${sequenceCode} not found or inactive`);
    return { success: false };
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("email_sequence_enrollments")
    .select("id")
    .eq("lead_id", leadId)
    .eq("sequence_id", sequence.id)
    .maybeSingle();

  if (existing) {
    return { success: true, enrollmentId: existing.id, isExisting: true };
  }

  // Get first step delay
  const { data: firstStep } = await supabase
    .from("email_sequence_steps")
    .select("delay_hours")
    .eq("sequence_id", sequence.id)
    .eq("step_number", 1)
    .maybeSingle();

  const delayHours = firstStep?.delay_hours || 0;
  const nextDue = new Date();
  nextDue.setHours(nextDue.getHours() + delayHours);

  const { data: enrollment, error } = await supabase
    .from("email_sequence_enrollments")
    .insert({
      sequence_id: sequence.id,
      lead_id: leadId,
      email,
      first_name: firstName,
      current_step: 0,
      status: "active",
      next_email_due_at: nextDue.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[enrollLeadInSequence] error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, enrollmentId: enrollment.id };
}

export async function getLeadStats() {
  const supabase = await createClient();

  const [
    { count: totalLeads },
    { count: newLeads },
    { count: converted },
    { data: sourceBreakdown },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "lead"),
    supabase.from("leads").select("id", { count: "exact", head: true }).not("converted_at", "is", null),
    supabase
      .from("leads")
      .select("source")
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        (data || []).forEach((l) => {
          const s = l.source || "unknown";
          counts[s] = (counts[s] || 0) + 1;
        });
        return { data: counts };
      }),
  ]);

  return {
    totalLeads: totalLeads || 0,
    newLeads: newLeads || 0,
    converted: converted || 0,
    sourceBreakdown: sourceBreakdown || {},
  };
}
