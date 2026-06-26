import type { IntegrationProvider } from "./types";

// Placeholder for the mailchimp integration. Implemented in Phase 4.
export const mailchimp: IntegrationProvider = {
  id: "mailchimp",
  label: "mailchimp",
  async parseWebhook() {
    return [];
  },
};
