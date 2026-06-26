import type { IntegrationProvider } from "./types";
import type { VouchEvent } from "@/lib/types";

// Zapier sends a flat JSON object per task; same shape as the generic webhook.
export const zapier: IntegrationProvider = {
  id: "zapier",
  label: "Zapier",
  async parseWebhook(payload: any): Promise<Partial<VouchEvent>[]> {
    if (!payload || typeof payload !== "object") return [];
    return [{
      event_type: payload.event_type ?? "recent_signup",
      name: payload.name ?? null, city: payload.city ?? null, country: payload.country ?? null,
      product: payload.product ?? null, value: payload.value ?? null,
    }];
  },
};
