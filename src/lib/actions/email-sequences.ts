"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import {
  newLeadWelcomeEmail,
  newLeadFollowUpEmail,
  newLeadFinalEmail,
  applicationReminderEmail,
  applicationFinalReminderEmail,
  acceptedEnrollmentReminderEmail,
} from "@/lib/email-templates";

// Template code to email function mapping
const templateFunctions: Record<
  string,
  (params: { firstName: string; applicationLink?: string; enrollmentDeadline?: string }) => {
    subject: string;
    html: string;
  }
> = {
  new_lead_welcome: newLeadWelcomeEmail,
  new_lead_followup: newLeadFollowUpEmail,
  new_lead_final: newLeadFinalEmail,
  application_reminder: (params) =>
    applicationReminderEmail({
      firstName: params.firstName,
      applicationLink: params.applicationLink || "https://mystrosbarber.com/apply",
    }),
  application_final_reminder: (params) =>
    applicationFinalReminderEmail({
      firstName: params.firstName,
      applicationLink: params.applicationLink || "https://mystrosbarber.com/apply",
    }),
  accepted_enrollment_reminder: acceptedEnrollmentReminderEmail,
};

export interface EmailSequence {
  id: string;
  name: string;
  code: string;
  description: string | null;
  trigger_event: string;
  is_active: boolean;
  step_count?: number;
}

export interface SequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  delay_hours: number;
  subject: string;
  template_code: string;
  is_active: boolean;
}

export interface SequenceEnrollment {
  id: string;
  sequence_id: string;
  lead_id: string | null;
  application_id: string | null;
  email: string;
  first_name: string | null;
  current_step: number;
  status: string;
  enrolled_at: string;
  last_email_sent_at: string | null;
  next_email_due_at: string | null;
  completed_at: string | null;
}

export async function getSequences(): Promise<EmailSequence[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("email_sequences")
    .select("*, email_sequence_steps(count)")
    .order("created_at");

  if (error) {
    console.error("Failed to fetch sequences:", error);
    return [];
  }

  return data.map((s) => ({
    id: s.id as string,
    name: s.name as string,
    code: s.code as string,
    description: s.description as string | null,
    trigger_event: s.trigger_event as string,
    is_active: s.is_active as boolean,
    step_count: (s.email_sequence_steps as { count: number }[] | undefined)?.[0]?.count || 0,
  }));
}

export async function getSequenceWithSteps(
  sequenceId: string
): Promise<{ sequence: EmailSequence; steps: SequenceStep[] } | null> {
  const supabase = createAdminClient();

  const { data: sequence, error: seqError } = await supabase
    .from("email_sequences")
    .select("*")
    .eq("id", sequenceId)
    .single();

  if (seqError || !sequence) {
    console.error("Failed to fetch sequence:", seqError);
    return null;
  }

  const { data: steps, error: stepsError } = await supabase
    .from("email_sequence_steps")
    .select("*")
    .eq("sequence_id", sequenceId)
    .order("step_number");

  if (stepsError) {
    console.error("Failed to fetch steps:", stepsError);
    return null;
  }

  return {
    sequence: sequence as EmailSequence,
    steps: steps as SequenceStep[],
  };
}

export async function enrollInSequence(params: {
  sequenceCode: string;
  email: string;
  firstName?: string;
  leadId?: string;
  applicationId?: string;
}): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
  const supabase = createAdminClient();

  // Get the sequence by code
  const { data: sequence, error: seqError } = await supabase
    .from("email_sequences")
    .select("id")
    .eq("code", params.sequenceCode)
    .eq("is_active", true)
    .single();

  if (seqError || !sequence) {
    console.error("Sequence not found:", params.sequenceCode);
    return { success: false, error: "Sequence not found" };
  }

  // Check if already enrolled in this sequence
  const { data: existing } = await supabase
    .from("email_sequence_enrollments")
    .select("id, status")
    .eq("sequence_id", sequence.id)
    .eq("email", params.email)
    .single();

  if (existing && existing.status === "active") {
    return { success: false, error: "Already enrolled in sequence" };
  }

  // Get first step to determine delay
  const { data: firstStep } = await supabase
    .from("email_sequence_steps")
    .select("delay_hours")
    .eq("sequence_id", sequence.id)
    .eq("step_number", 1)
    .single();

  const delayHours = firstStep?.delay_hours || 0;
  const nextDue = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();

  // Create enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from("email_sequence_enrollments")
    .insert({
      sequence_id: sequence.id,
      lead_id: params.leadId || null,
      application_id: params.applicationId || null,
      email: params.email,
      first_name: params.firstName || null,
      current_step: 0,
      status: "active",
      next_email_due_at: nextDue,
    })
    .select()
    .single();

  if (enrollError) {
    console.error("Failed to create enrollment:", enrollError);
    return { success: false, error: "Failed to create enrollment" };
  }

  return { success: true, enrollmentId: enrollment.id };
}

export async function processSequenceEmail(
  enrollmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Get enrollment with sequence info
  const { data: enrollment, error: enrollError } = await supabase
    .from("email_sequence_enrollments")
    .select("*, email_sequences(*)")
    .eq("id", enrollmentId)
    .single();

  if (enrollError || !enrollment) {
    return { success: false, error: "Enrollment not found" };
  }

  const nextStep = enrollment.current_step + 1;

  // Get the next step
  const { data: step, error: stepError } = await supabase
    .from("email_sequence_steps")
    .select("*")
    .eq("sequence_id", enrollment.sequence_id)
    .eq("step_number", nextStep)
    .eq("is_active", true)
    .single();

  if (stepError || !step) {
    // No more steps - mark as completed
    await supabase
      .from("email_sequence_enrollments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        next_email_due_at: null,
      })
      .eq("id", enrollmentId);

    return { success: true };
  }

  // Generate email content
  const templateFn = templateFunctions[step.template_code];
  if (!templateFn) {
    console.error("Unknown template code:", step.template_code);
    return { success: false, error: `Unknown template: ${step.template_code}` };
  }

  const emailContent = templateFn({
    firstName: enrollment.first_name || "there",
    applicationLink: enrollment.application_id
      ? `https://mystrosbarber.com/apply/continue/${enrollment.application_id}`
      : undefined,
  });

  // Send the email
  const result = await sendEmail({
    to: enrollment.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  if (!result.success) {
    console.error("Failed to send sequence email:", result.error);
    return { success: false, error: "Failed to send email" };
  }

  // Log the sent email
  await supabase.from("email_sequence_logs").insert({
    enrollment_id: enrollmentId,
    step_id: step.id,
    resend_message_id: result.messageId || null,
    status: "sent",
  });

  // Check if there's a next step
  const { data: nextStepData } = await supabase
    .from("email_sequence_steps")
    .select("delay_hours")
    .eq("sequence_id", enrollment.sequence_id)
    .eq("step_number", nextStep + 1)
    .single();

  let nextDueAt: string | null = null;
  if (nextStepData) {
    nextDueAt = new Date(
      Date.now() + nextStepData.delay_hours * 60 * 60 * 1000
    ).toISOString();
  }

  // Update enrollment
  await supabase
    .from("email_sequence_enrollments")
    .update({
      current_step: nextStep,
      last_email_sent_at: new Date().toISOString(),
      next_email_due_at: nextDueAt,
      status: nextDueAt ? "active" : "completed",
      completed_at: nextDueAt ? null : new Date().toISOString(),
    })
    .eq("id", enrollmentId);

  return { success: true };
}

export async function pauseEnrollment(
  enrollmentId: string
): Promise<{ success: boolean }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("email_sequence_enrollments")
    .update({ status: "paused" })
    .eq("id", enrollmentId);

  return { success: !error };
}

export async function resumeEnrollment(
  enrollmentId: string
): Promise<{ success: boolean }> {
  const supabase = createAdminClient();

  // Get enrollment to recalculate next due time
  const { data: enrollment } = await supabase
    .from("email_sequence_enrollments")
    .select("*, email_sequence_steps!inner(delay_hours)")
    .eq("id", enrollmentId)
    .single();

  if (!enrollment) {
    return { success: false };
  }

  const nextDue = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Resume in 1 hour

  const { error } = await supabase
    .from("email_sequence_enrollments")
    .update({
      status: "active",
      next_email_due_at: nextDue,
    })
    .eq("id", enrollmentId);

  return { success: !error };
}

export async function unsubscribe(email: string): Promise<{ success: boolean }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("email_sequence_enrollments")
    .update({ status: "unsubscribed" })
    .eq("email", email)
    .eq("status", "active");

  return { success: !error };
}

export async function getActiveEnrollmentsDue(): Promise<SequenceEnrollment[]> {
  const supabase = createAdminClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("email_sequence_enrollments")
    .select("*")
    .eq("status", "active")
    .lte("next_email_due_at", now)
    .order("next_email_due_at")
    .limit(100);

  if (error) {
    console.error("Failed to fetch active enrollments:", error);
    return [];
  }

  return data as SequenceEnrollment[];
}

export async function getEnrollmentsByLead(
  leadId: string
): Promise<SequenceEnrollment[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("email_sequence_enrollments")
    .select("*, email_sequences(name, code)")
    .eq("lead_id", leadId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch enrollments for lead:", error);
    return [];
  }

  return data as SequenceEnrollment[];
}
