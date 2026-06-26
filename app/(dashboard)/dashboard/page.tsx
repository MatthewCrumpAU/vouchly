import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { timeAgo, formatNumber } from "@/lib/utils";
import { NOTIFICATION_LABELS } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [websites, campaigns, impressions, clicks, recent] = await Promise.all([
    supabase.from("websites").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("analytics_impressions").select("id, website_id", { count: "exact", head: true }),
    supabase.from("analytics_clicks").select("id, website_id", { count: "exact", head: true }),
    supabase.from("events").select("event_type, name, city, product, created_at")
      .order("created_at", { ascending: false }).limit(8),
  ]);

  const imp = impressions.count ?? 0;
  const clk = clicks.count ?? 0;
  const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Websites", value: formatNumber(websites.count ?? 0) },
    { label: "Campaigns", value: formatNumber(campaigns.count ?? 0) },
    { label: "Impressions", value: formatNumber(imp) },
    { label: "Clicks", value: formatNumber(clk) },
    { label: "CTR", value: `${ctr}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <Link href="/campaigns" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          New campaign
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">Recent activity</h2>
        {recent.data && recent.data.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {recent.data.map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-700">
                  <span className="font-medium">{e.name ?? "Someone"}</span>
                  {e.city ? ` from ${e.city}` : ""} · {NOTIFICATION_LABELS[e.event_type as keyof typeof NOTIFICATION_LABELS]}
                  {e.product ? ` · ${e.product}` : ""}
                </span>
                <span className="text-xs text-slate-400">{timeAgo(e.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">
            No activity yet. Add a website and create your first campaign to get started.
          </p>
        )}
      </Card>
    </div>
  );
}
