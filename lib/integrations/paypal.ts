import type { IntegrationProvider } from "./types";

// Placeholder for the paypal integration. Implemented in Phase 4.
export const paypal: IntegrationProvider = {
  id: "paypal",
  label: "paypal",
  async parseWebhook() {
    return [];
  },
};
