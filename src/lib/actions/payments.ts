"use server";

import { isStripeEnabled } from "@/lib/stripe";

export async function getPaymentStatus() {
  return { enabled: isStripeEnabled() };
}
