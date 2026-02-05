import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/retell";
import { processRetellWebhook } from "@/lib/actions/retell-calls";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-retell-signature") || "";
    const secret = process.env["RETELL_WEBHOOK_SECRET"] || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);

    // Process the webhook event
    const result = await processRetellWebhook(event);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Retell webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Acknowledge HEAD requests (Retell uses this to verify endpoint)
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
