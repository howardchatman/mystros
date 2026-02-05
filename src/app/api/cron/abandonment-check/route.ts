import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollInSequence } from "@/lib/actions/email-sequences";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env["CRON_SECRET"];

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Find applications that:
    // 1. Have not been submitted (submitted_at IS NULL)
    // 2. Last activity was more than 48 hours ago
    // 3. Have an email we can contact
    const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: abandonedApps, error: appsError } = await supabase
      .from("applications")
      .select("id, first_name, email")
      .is("submitted_at", null)
      .lt("last_activity_at", threshold)
      .not("email", "is", null);

    if (appsError) {
      console.error("Failed to fetch abandoned applications:", appsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    if (!abandonedApps || abandonedApps.length === 0) {
      return NextResponse.json({
        enrolled: 0,
        message: "No abandoned applications found",
      });
    }

    // Check which ones are not already enrolled in the reminder sequence
    const { data: existingEnrollments } = await supabase
      .from("email_sequence_enrollments")
      .select("application_id")
      .in(
        "application_id",
        abandonedApps.map((a) => a.id)
      )
      .eq("status", "active");

    const alreadyEnrolled = new Set(
      existingEnrollments?.map((e) => e.application_id) || []
    );

    // Enroll new abandoned applications
    let enrolled = 0;
    let failed = 0;

    for (const app of abandonedApps) {
      if (alreadyEnrolled.has(app.id)) {
        continue;
      }

      const result = await enrollInSequence({
        sequenceCode: "application_reminder",
        email: app.email,
        firstName: app.first_name,
        applicationId: app.id,
      });

      if (result.success) {
        enrolled++;
      } else {
        failed++;
        console.error(
          `Failed to enroll application ${app.id}:`,
          result.error
        );
      }
    }

    return NextResponse.json({
      enrolled,
      failed,
      total: abandonedApps.length,
      alreadyEnrolled: alreadyEnrolled.size,
      message: `Enrolled ${enrolled} abandoned applications in reminder sequence`,
    });
  } catch (error) {
    console.error("Abandonment check cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
