// Registry of available integrations. Phase 4 wires real logic into each.
export const INTEGRATIONS = [
  "stripe", "shopify", "woocommerce", "paypal", "zapier", "webhooks",
  "mailchimp", "convertkit", "calendly", "wordpress",
  "google-reviews", "facebook-reviews", "trustpilot",
] as const;
export type IntegrationId = (typeof INTEGRATIONS)[number];
