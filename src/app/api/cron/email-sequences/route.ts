import { NextRequest, NextResponse } from "next/server";
import {
  getActiveEnrollmentsDue,
  processSequenceEmail,
} from "@/lib/actions/email-sequences";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for processing

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env["CRON_SECRET"];

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all enrollments due for their next email
    const enrollments = await getActiveEnrollmentsDue();

    if (enrollments.length === 0) {
      return NextResponse.json({
        processed: 0,
        message: "No enrollments due for processing",
      });
    }

    // Process in batches
    const batchSize = 50;
    let processed = 0;
    let failed = 0;

    for (let i = 0; i < enrollments.length; i += batchSize) {
      const batch = enrollments.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map((enrollment) => processSequenceEmail(enrollment.id))
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.success) {
          processed++;
        } else {
          failed++;
          console.error(
            "Failed to process enrollment:",
            result.status === "rejected" ? result.reason : result.value.error
          );
        }
      }
    }

    return NextResponse.json({
      processed,
      failed,
      total: enrollments.length,
      message: `Processed ${processed} emails, ${failed} failed`,
    });
  } catch (error) {
    console.error("Email sequences cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
