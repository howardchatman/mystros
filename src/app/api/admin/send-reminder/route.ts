import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enrollInSequence } from "@/lib/actions/email-sequences";
import { sendEmail } from "@/lib/resend";
import { applicationReminderEmail } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin role
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowedRoles = ["superadmin", "campus_admin", "admissions"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { applicationId, email, firstName, sequenceCode } = await request.json();

    if (!applicationId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If enrolling in a sequence
    if (sequenceCode) {
      const result = await enrollInSequence({
        sequenceCode,
        email,
        firstName,
        applicationId,
      });

      if (!result.success && result.error !== "Already enrolled in sequence") {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      // If already enrolled, just send a one-off reminder
      if (result.error === "Already enrolled in sequence") {
        const emailContent = applicationReminderEmail({
          firstName: firstName || "there",
          applicationLink: `https://mystrosbarber.com/apply/continue/${applicationId}`,
        });

        await sendEmail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        return NextResponse.json({
          success: true,
          message: "Reminder sent (already in sequence)",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
