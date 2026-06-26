import type { IntegrationProvider } from "./types";

// Placeholder for the shopify integration. Implemented in Phase 4.
export const shopify: IntegrationProvider = {
  id: "shopify",
  label: "shopify",
  async parseWebhook() {
    return [];
  },
};
