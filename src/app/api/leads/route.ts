import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/actions/leads";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { firstName, lastName, email, phone, programInterest, source, utmSource, utmMedium, utmCampaign } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Get referrer for source detail
    const referrer = req.headers.get("referer") || undefined;

    const result = await createLead({
      firstName,
      lastName,
      email,
      phone,
      programInterest,
      source: source || "website",
      sourceDetail: referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      isExisting: result.isExisting,
    });
  } catch (error) {
    console.error("[POST /api/leads] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
