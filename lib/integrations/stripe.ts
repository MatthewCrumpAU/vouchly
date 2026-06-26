import type { IntegrationProvider } from "./types";
import type { VouchEvent } from "@/lib/types";

// Maps Stripe payment events into "recent_purchase" Vouch events.
// In production, verify the Stripe-Signature header before trusting payloads.
export const stripe: IntegrationProvider = {
  id: "stripe",
  label: "Stripe",
  async parseWebhook(payload: any): Promise<Partial<VouchEvent>[]> {
    const type = payload?.type;
    const obj = payload?.data?.object ?? {};
    if (type === "checkout.session.completed" || type === "payment_intent.succeeded") {
      const details = obj.customer_details ?? {};
      return [{
        event_type: "recent_purchase",
        name: (details.name || obj.billing_details?.name || "Someone").split(" ")[0],
        city: details.address?.city ?? null,
        country: details.address?.country ?? null,
        product: obj.description || "a purchase",
        value: (obj.amount_total ?? obj.amount ?? 0) / 100,
      }];
    }
    return [];
  },
};
