import type { IntegrationProvider } from "./types";

// Placeholder for the calendly integration. Implemented in Phase 4.
export const calendly: IntegrationProvider = {
  id: "calendly",
  label: "calendly",
  async parseWebhook() {
    return [];
  },
};
