import type { IntegrationProvider } from "./types";

// Placeholder for the wordpress integration. Implemented in Phase 4.
export const wordpress: IntegrationProvider = {
  id: "wordpress",
  label: "wordpress",
  async parseWebhook() {
    return [];
  },
};
