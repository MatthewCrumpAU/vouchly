import type { IntegrationProvider } from "./types";

// Placeholder for the convertkit integration. Implemented in Phase 4.
export const convertkit: IntegrationProvider = {
  id: "convertkit",
  label: "convertkit",
  async parseWebhook() {
    return [];
  },
};
