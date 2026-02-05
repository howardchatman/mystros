"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createLead, enrollLeadInSequence } from "./leads";

export interface RetellCallData {
  call_id: string;
  caller_name?: string;
  caller_email?: string;
  caller_phone?: string;
  duration_ms?: number;
  transcript?: string;
  summary?: string;
  sentiment?: string;
  call_status?: string;
}

export async function saveRetellCall(data: RetellCallData) {
  const supabase = createAdminClient();

  const { data: call, error } = await supabase
    .from("retell_calls")
    .insert({
      call_id: data.call_id,
      caller_name: data.caller_name,
      caller_email: data.caller_email,
      caller_phone: data.caller_phone,
      duration_ms: data.duration_ms,
      transcript: data.transcript,
      summary: data.summary,
      sentiment: data.sentiment,
      call_status: data.call_status,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save Retell call:", error);
    throw new Error("Failed to save call record");
  }

  return call;
}

export async function linkCallToLead(callId: string, leadId: string) {
  const supabase = createAdminClient();

  // Update the lead with the retell_call_id
  const { error: leadError } = await supabase
    .from("leads")
    .update({ retell_call_id: callId })
    .eq("id", leadId);

  if (leadError) {
    console.error("Failed to link call to lead:", leadError);
  }

  // Update the retell_calls record with the lead_id
  const { error: callError } = await supabase
    .from("retell_calls")
    .update({ lead_id: leadId })
    .eq("call_id", callId);

  if (callError) {
    console.error("Failed to link lead to call:", callError);
  }
}

export async function getCallsForLead(leadId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("retell_calls")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch calls for lead:", error);
    return [];
  }

  return data;
}

export async function processRetellWebhook(event: {
  event: string;
  call: {
    call_id: string;
    call_status?: string;
    duration_ms?: number;
    transcript?: string;
    call_analysis?: {
      sentiment?: string;
      summary?: string;
      custom_analysis?: Record<string, unknown>;
    };
    metadata?: Record<string, string>;
  };
}) {
  // Only process call_analyzed events
  if (event.event !== "call_analyzed") {
    return { processed: false, reason: "Not a call_analyzed event" };
  }

  const { call } = event;

  // Extract contact info from metadata or custom_analysis
  const metadata = call.metadata || {};
  const customAnalysis = call.call_analysis?.custom_analysis || {};

  const callerName =
    metadata["caller_name"] ||
    (customAnalysis["caller_name"] as string) ||
    undefined;
  const callerEmail =
    metadata["caller_email"] ||
    (customAnalysis["caller_email"] as string) ||
    undefined;
  const callerPhone =
    metadata["caller_phone"] ||
    (customAnalysis["caller_phone"] as string) ||
    undefined;

  // Save the call record
  const savedCall = await saveRetellCall({
    call_id: call.call_id,
    caller_name: callerName,
    caller_email: callerEmail,
    caller_phone: callerPhone,
    duration_ms: call.duration_ms,
    transcript: call.transcript,
    summary: call.call_analysis?.summary,
    sentiment: call.call_analysis?.sentiment,
    call_status: call.call_status,
  });

  // If we have email or phone, create a lead
  if (callerEmail || callerPhone) {
    try {
      // Parse first/last name from caller_name
      let firstName = "Unknown";
      let lastName = "Caller";
      if (callerName) {
        const parts = callerName.trim().split(" ");
        firstName = parts[0] || "Unknown";
        lastName = parts.slice(1).join(" ") || "Caller";
      }

      const leadResult = await createLead({
        firstName,
        lastName,
        email: callerEmail || `${call.call_id}@phone.lead`,
        phone: callerPhone,
        source: "retell_ai",
        sourceDetail: `Call ID: ${call.call_id}`,
      });

      if (!leadResult.success || !leadResult.leadId) {
        return {
          processed: true,
          callId: savedCall.id,
          leadId: null,
          error: leadResult.error || "Failed to create lead",
        };
      }

      // Link the call to the lead
      await linkCallToLead(call.call_id, leadResult.leadId);

      // Enroll in nurture sequence if not already enrolled by createLead
      if (callerEmail) {
        await enrollLeadInSequence(leadResult.leadId, callerEmail, firstName, "new_lead_nurture");
      }

      return {
        processed: true,
        callId: savedCall.id,
        leadId: leadResult.leadId,
      };
    } catch (error) {
      console.error("Failed to create lead from Retell call:", error);
      return {
        processed: true,
        callId: savedCall.id,
        leadId: null,
        error: "Failed to create lead",
      };
    }
  }

  return {
    processed: true,
    callId: savedCall.id,
    leadId: null,
    reason: "No contact information captured",
  };
}
