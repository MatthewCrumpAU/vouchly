import type { IntegrationProvider } from "./types";

// Placeholder for the facebook-reviews integration. Implemented in Phase 4.
export const facebook_reviews: IntegrationProvider = {
  id: "facebook-reviews",
  label: "facebook-reviews",
  async parseWebhook() {
    return [];
  },
};
