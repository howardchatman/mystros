import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeEnabled } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { studentId, amount, description } = body as {
    studentId: string;
    amount: number;
    description?: string;
  };

  if (!studentId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate student belongs to this user
  const { data: student } = await supabase
    .from("students")
    .select("id, student_number, first_name, last_name")
    .eq("id", studentId)
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Verify student account exists
  const { data: account } = await supabase
    .from("student_accounts")
    .select("id")
    .eq("student_id", student.id)
    .single();

  if (!account) {
    return NextResponse.json({ error: "No account found" }, { status: 404 });
  }

  try {
    const stripe = getStripe();
    const siteUrl = process.env["NEXT_PUBLIC_SITE_URL"] || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description || `Tuition Payment - ${student.first_name} ${student.last_name}`,
              description: `Student ID: ${student.student_number}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/my-financial-aid?payment=success`,
      cancel_url: `${siteUrl}/my-financial-aid?payment=cancelled`,
      metadata: {
        student_id: student.id,
        student_account_id: account.id,
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Checkout] Error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
