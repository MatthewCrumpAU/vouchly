"use client";

import { startCheckout, openPortal } from "@/app/(dashboard)/settings/actions";
import type { PlanTier } from "@/lib/plans";

export function UpgradeButton({ plan, current, owner }: { plan: PlanTier; current: boolean; owner?: boolean }) {
  if (owner) {
    return <button disabled className="mt-4 w-full cursor-default rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400">Included in Lifetime</button>;
  }
  if (current) {
    return <button disabled className="mt-4 w-full cursor-default rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400">Current plan</button>;
  }
  if (plan === "free") {
    return (
      <form action={openPortal}>
        <button className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Manage / downgrade</button>
      </form>
    );
  }
  return (
    <form action={startCheckout}>
      <input type="hidden" name="plan" value={plan} />
      <button className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">Upgrade</button>
    </form>
  );
}

export function ManageBillingButton() {
  return (
    <form action={openPortal}>
      <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Manage billing</button>
    </form>
  );
}
