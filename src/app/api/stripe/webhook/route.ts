import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeEnabled } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM_EMAIL } from "@/lib/email";
import { paymentConfirmationEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const studentId = metadata["student_id"];
    const studentAccountId = metadata["student_account_id"];

    if (studentId && studentAccountId) {
      const supabase = createAdminClient();
      const amountPaid = (session.amount_total || 0) / 100;

      // Record the payment
      const { error: paymentError } = await supabase.from("payments").insert({
        student_id: studentId,
        amount: amountPaid,
        payment_method: "stripe",
        payment_date: new Date().toISOString().split("T")[0],
        stripe_payment_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        notes: "Online payment via Stripe",
        status: "completed",
      });

      if (paymentError) {
        console.error("[Stripe Webhook] Payment insert error:", paymentError.message);
      }

      // Update account balance
      const { data: account } = await supabase
        .from("student_accounts")
        .select("total_payments, total_charges, total_aid_posted")
        .eq("student_id", studentId)
        .single();

      if (account) {
        const newTotalPayments = (account.total_payments || 0) + amountPaid;
        const currentBalance = (account.total_charges || 0) - newTotalPayments - (account.total_aid_posted || 0);

        await supabase
          .from("student_accounts")
          .update({
            total_payments: newTotalPayments,
            current_balance: currentBalance,
          })
          .eq("student_id", studentId);
      }

      // Send payment confirmation email
      const { data: studentProfile } = await supabase
        .from("students")
        .select("email, first_name")
        .eq("id", studentId)
        .single();

      if (studentProfile?.email) {
        const newBalance = account
          ? (account.total_charges || 0) - ((account.total_payments || 0) + amountPaid) - (account.total_aid_posted || 0)
          : 0;

        const { subject, html } = paymentConfirmationEmail({
          firstName: studentProfile.first_name,
          amount: amountPaid,
          paymentDate: new Date().toLocaleDateString("en-US"),
          paymentMethod: "Credit/Debit Card (Stripe)",
          confirmationNumber: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
          newBalance,
        });

        getResend().emails.send({
          from: FROM_EMAIL,
          to: studentProfile.email,
          subject,
          html,
        }).catch((err: unknown) => console.error("[Stripe Webhook] Email send error:", err));
      }

      // Audit log
      await supabase.from("audit_log").insert({
        table_name: "payments",
        record_id: studentId,
        action: "create",
        new_data: {
          amount: amountPaid,
          method: "stripe",
          source: "stripe_webhook",
        },
      }).then(null, () => {});
    }
  }

  return NextResponse.json({ received: true });
}
