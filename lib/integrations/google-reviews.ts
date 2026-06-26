import type { IntegrationProvider } from "./types";

// Placeholder for the google-reviews integration. Implemented in Phase 4.
export const google_reviews: IntegrationProvider = {
  id: "google-reviews",
  label: "google-reviews",
  async parseWebhook() {
    return [];
  },
};
