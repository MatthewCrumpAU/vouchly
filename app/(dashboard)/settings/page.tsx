import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { PLANS, PUBLIC_PLANS, planFor, type PlanTier } from "@/lib/plans";
import { formatNumber } from "@/lib/utils";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/billing-buttons";
import { WhiteLabelForm } from "@/components/dashboard/white-label-form";

function Bar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  return <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${pct >= 80 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} /></div>;
}

const BANNERS: Record<string, { kind: string; text: string }> = {
  success: { kind: "ok", text: "Subscription updated — welcome to your new plan!" },
  cancel: { kind: "warn", text: "Checkout canceled. No changes were made." },
  unconfigured: { kind: "warn", text: "Stripe isn't configured yet. Add your keys and price IDs to enable checkout." },
};

export default async function SettingsPage({ searchParams }: { searchParams: { billing?: string; wl?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, websites, campaigns, { data: usedRaw }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, plan, brand_name, brand_color, white_label").eq("id", user!.id).single(),
    supabase.from("websites").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.rpc("current_month_impressions", { p_user: user!.id }),
  ]);

  const plan = (profile?.plan ?? "free") as PlanTier;
  const limits = planFor(plan);
  const usedImp = (usedRaw as number) ?? 0;
  const fmtLimit = (n: number) => (n === -1 ? "Unlimited" : formatNumber(n));
  const usage = [
    { label: "Websites", used: websites.count ?? 0, limit: limits.websites },
    { label: "Campaigns", used: campaigns.count ?? 0, limit: limits.campaigns },
    { label: "Impressions this month", used: usedImp, limit: limits.impressions },
  ];
  const banner = searchParams.billing ? BANNERS[searchParams.billing] : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {banner && (
        <div className={`rounded-lg border px-3 py-2 text-sm ${banner.kind === "ok" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{banner.text}</div>
      )}

      <Card>
        <h2 className="mb-3 font-semibold">Profile</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{profile?.full_name || "—"}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{profile?.email}</dd></div>
        </dl>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Plan & usage</h2>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{limits.label}</span>
            {plan !== "free" && <ManageBillingButton />}
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {usage.map((u) => (
            <div key={u.label}>
              <div className="flex items-center justify-between text-sm"><span className="text-slate-600">{u.label}</span><span className="tabular-nums text-slate-500">{formatNumber(u.used)} / {fmtLimit(u.limit)}</span></div>
              {u.limit !== -1 && <Bar used={u.used} limit={u.limit} />}
            </div>
          ))}
        </div>
      </Card>

      {plan === "lifetime" && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          You're on the <strong>Lifetime (owner)</strong> plan — unlimited everything, all features unlocked.
        </div>
      )}

      <div>
        <h2 className="mb-3 font-semibold">Plans</h2>
        <div className="grid gap-4 lg:grid-cols-4">
          {PUBLIC_PLANS.map((key) => {
            const p = PLANS[key];
            const current = key === plan;
            return (
              <Card key={key} className={current ? "ring-2 ring-brand-500" : ""}>
                <div className="flex items-center justify-between"><h3 className="font-bold">{p.label}</h3>{current && <span className="text-xs font-medium text-brand-600">Current</span>}</div>
                <p className="mt-1 text-2xl font-extrabold">${p.priceMonthly}<span className="text-sm font-medium text-slate-400">/mo</span></p>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  <li>{fmtLimit(p.websites)} websites</li><li>{fmtLimit(p.campaigns)} campaigns</li>
                  <li>{formatNumber(p.impressions)} impressions/mo</li><li>{p.removeBranding ? "No branding" : "Vouch branding"}</li>
                </ul>
                <UpgradeButton plan={key} current={current} owner={plan === "lifetime"} />
              </Card>
            );
          })}
        </div>
      </div>

      <WhiteLabelForm
        locked={!limits.whiteLabel}
        brandName={profile?.brand_name || ""}
        brandColor={profile?.brand_color || "#4f46e5"}
        enabled={!!profile?.white_label}
      />

      {limits.clientAccounts && (
        <Card>
          <div className="flex items-center justify-between">
            <div><h2 className="font-semibold">Agency client accounts</h2><p className="text-sm text-slate-500">Group websites into client workspaces.</p></div>
            <Link href="/clients" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Manage clients</Link>
          </div>
        </Card>
      )}
    </div>
  );
}
