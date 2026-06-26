import type { IntegrationProvider } from "./types";

// Placeholder for the trustpilot integration. Implemented in Phase 4.
export const trustpilot: IntegrationProvider = {
  id: "trustpilot",
  label: "trustpilot",
  async parseWebhook() {
    return [];
  },
};
