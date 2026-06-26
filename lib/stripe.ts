import Stripe from "stripe";
import type { PlanTier } from "./plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Pin to a known version for stable webhook payload typing.
  apiVersion: "2024-06-20",
  typescript: true,
});

// Map plans <-> Stripe price IDs (set these in your env once you create the
// products/prices in the Stripe dashboard).
export const PRICE_IDS: Partial<Record<PlanTier, string | undefined>> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  agency: process.env.STRIPE_PRICE_AGENCY,
};

export function planFromPriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return "free";
  const entry = (Object.entries(PRICE_IDS) as [PlanTier, string | undefined][])
    .find(([, id]) => id && id === priceId);
  return entry ? entry[0] : "free";
}

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
