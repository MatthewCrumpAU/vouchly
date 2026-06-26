import type { IntegrationProvider } from "./types";
import type { VouchEvent } from "@/lib/types";

// Generic JSON webhook. Accepts a single event object or an array of them:
// { event_type, name, city, country, product, value, url }
export const webhooks: IntegrationProvider = {
  id: "webhooks",
  label: "Custom webhook",
  async parseWebhook(payload: any): Promise<Partial<VouchEvent>[]> {
    const rows = Array.isArray(payload) ? payload : [payload];
    return rows.filter(Boolean).map((r) => ({
      event_type: r.event_type ?? "custom",
      name: r.name ?? null, city: r.city ?? null, country: r.country ?? null,
      product: r.product ?? null, value: r.value ?? null, url: r.url ?? null,
      metadata: r.metadata ?? {},
    }));
  },
};
