import type { IntegrationProvider } from "./types";
import { stripe } from "./stripe";
import { zapier } from "./zapier";
import { webhooks } from "./webhooks";

// Providers with a working parseWebhook. Others in INTEGRATIONS are UI
// placeholders until their handlers are implemented.
export const PROVIDERS: Record<string, IntegrationProvider> = { stripe, zapier, webhooks };
export const LIVE_PROVIDERS = Object.keys(PROVIDERS);
