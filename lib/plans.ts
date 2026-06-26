// Plan definitions + limit checks. Limits are enforced in code so they can be
// switched on without schema changes. Phase 1 stores limits; enforcement hooks
// live in helpers below for use by server actions / API routes.

export type PlanTier = "free" | "starter" | "pro" | "agency" | "lifetime";

export interface PlanLimits {
  label: string;
  priceMonthly: number; // USD; 0 = free
  websites: number; // -1 = unlimited
  campaigns: number; // -1 = unlimited
  impressions: number; // per month
  removeBranding: boolean;
  advancedRules: boolean;
  integrations: boolean;
  whiteLabel: boolean;
  clientAccounts: boolean;
}

export const PLANS: Record<PlanTier, PlanLimits> = {
  free: {
    label: "Free",
    priceMonthly: 0,
    websites: 1,
    campaigns: 1,
    impressions: 1_000,
    removeBranding: false,
    advancedRules: false,
    integrations: false,
    whiteLabel: false,
    clientAccounts: false,
  },
  starter: {
    label: "Starter",
    priceMonthly: 19,
    websites: 3,
    campaigns: 10,
    impressions: 50_000,
    removeBranding: true,
    advancedRules: false,
    integrations: false,
    whiteLabel: false,
    clientAccounts: false,
  },
  pro: {
    label: "Pro",
    priceMonthly: 49,
    websites: 10,
    campaigns: -1,
    impressions: 250_000,
    removeBranding: true,
    advancedRules: true,
    integrations: true,
    whiteLabel: false,
    clientAccounts: false,
  },
  agency: {
    label: "Agency",
    priceMonthly: 149,
    websites: -1,
    campaigns: -1,
    impressions: 1_000_000,
    removeBranding: true,
    advancedRules: true,
    integrations: true,
    whiteLabel: true,
    clientAccounts: true,
  },
  lifetime: {
    label: "Lifetime",
    priceMonthly: 0,
    websites: -1,
    campaigns: -1,
    impressions: -1,        // -1 = unlimited
    removeBranding: true,
    advancedRules: true,
    integrations: true,
    whiteLabel: true,
    clientAccounts: true,
  },
};

export const PUBLIC_PLANS: PlanTier[] = ["free", "starter", "pro", "agency"];

export function planFor(tier: PlanTier): PlanLimits {
  return PLANS[tier] ?? PLANS.free;
}

/** Returns true if a user on `tier` may create another website given `current` count. */
export function canAddWebsite(tier: PlanTier, current: number): boolean {
  const limit = planFor(tier).websites;
  return limit === -1 || current < limit;
}

/** Returns true if a user on `tier` may create another campaign given `current` count. */
export function canAddCampaign(tier: PlanTier, current: number): boolean {
  const limit = planFor(tier).campaigns;
  return limit === -1 || current < limit;
}

export function withinImpressionLimit(tier: PlanTier, used: number): boolean {
  const limit = planFor(tier).impressions;
  return limit === -1 || used < limit;
}
