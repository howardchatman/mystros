"use server";

import { createClient } from "@/lib/supabase/server";

export interface FunnelMetrics {
  leads: number;
  applicants: number;
  accepted: number;
  enrolled: number;
  leadToApplicant: number;
  applicantToAccepted: number;
  acceptedToEnrolled: number;
}

export async function getFunnelMetrics(): Promise<FunnelMetrics> {
  const supabase = await createClient();

  const [
    { count: leads },
    { count: applicants },
    { count: accepted },
    { count: enrolled },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "applicant"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("students").select("id", { count: "exact", head: true }).in("status", ["enrolled", "active", "graduated"]),
  ]);

  const leadsCount = leads || 0;
  const applicantsCount = applicants || 0;
  const acceptedCount = accepted || 0;
  const enrolledCount = enrolled || 0;

  return {
    leads: leadsCount,
    applicants: applicantsCount,
    accepted: acceptedCount,
    enrolled: enrolledCount,
    leadToApplicant: leadsCount > 0 ? Math.round((applicantsCount / leadsCount) * 100) : 0,
    applicantToAccepted: applicantsCount > 0 ? Math.round((acceptedCount / applicantsCount) * 100) : 0,
    acceptedToEnrolled: acceptedCount > 0 ? Math.round((enrolledCount / acceptedCount) * 100) : 0,
  };
}

export interface SourceBreakdown {
  source: string;
  count: number;
}

export async function getLeadSourceBreakdown(): Promise<SourceBreakdown[]> {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("source");

  const counts: Record<string, number> = {};
  (leads || []).forEach((l) => {
    const s = l.source || "unknown";
    counts[s] = (counts[s] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export interface FunnelActivity {
  id: string;
  type: "lead" | "application" | "student";
  name: string;
  action: string;
  timestamp: string;
}

export async function getRecentFunnelActivity(limit = 20): Promise<FunnelActivity[]> {
  const supabase = await createClient();

  const [{ data: leads }, { data: applications }, { data: students }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, first_name, last_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("applications")
      .select("id, first_name, last_name, status, submitted_at, reviewed_at, created_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("students")
      .select("id, first_name, last_name, status, enrollment_date, created_at")
      .in("status", ["enrolled", "active"])
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const activities: FunnelActivity[] = [];

  (leads || []).forEach((l) => {
    activities.push({
      id: l.id,
      type: "lead",
      name: `${l.first_name} ${l.last_name}`,
      action: "New lead created",
      timestamp: l.created_at,
    });
  });

  (applications || []).forEach((a) => {
    if (a.submitted_at) {
      activities.push({
        id: a.id,
        type: "application",
        name: `${a.first_name} ${a.last_name}`,
        action: a.status === "accepted" ? "Application accepted" : a.status === "denied" ? "Application denied" : "Application submitted",
        timestamp: a.reviewed_at || a.submitted_at,
      });
    }
  });

  (students || []).forEach((s) => {
    activities.push({
      id: s.id,
      type: "student",
      name: `${s.first_name} ${s.last_name}`,
      action: "Student enrolled",
      timestamp: s.enrollment_date || s.created_at,
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export interface AbandonedApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  programName: string | null;
  lastActivityAt: string;
  daysInactive: number;
}

export async function getAbandonedApplications(hoursThreshold = 48): Promise<AbandonedApplication[]> {
  const supabase = await createClient();

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hoursThreshold);

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id,
      first_name,
      last_name,
      email,
      last_activity_at,
      updated_at,
      program:programs(name)
    `)
    .is("submitted_at", null)
    .or(`last_activity_at.lt.${cutoff.toISOString()},last_activity_at.is.null`)
    .order("updated_at", { ascending: false })
    .limit(50);

  return (applications || []).map((a: any) => {
    const lastActivity = a.last_activity_at || a.updated_at;
    const daysSince = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    const prog = Array.isArray(a.program) ? a.program[0] : a.program;

    return {
      id: a.id,
      firstName: a.first_name,
      lastName: a.last_name,
      email: a.email,
      programName: prog?.name || null,
      lastActivityAt: lastActivity,
      daysInactive: daysSince,
    };
  });
}
