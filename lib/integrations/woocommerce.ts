import type { IntegrationProvider } from "./types";

// Placeholder for the woocommerce integration. Implemented in Phase 4.
export const woocommerce: IntegrationProvider = {
  id: "woocommerce",
  label: "woocommerce",
  async parseWebhook() {
    return [];
  },
};
