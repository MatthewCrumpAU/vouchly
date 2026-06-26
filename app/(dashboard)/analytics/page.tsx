import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { ctr, lastNDays, bucketByDay, countBy, topEntries } from "@/lib/analytics";
import { NOTIFICATION_LABELS } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const days = lastNDays(30);
  const since = days[0] + "T00:00:00Z";

  const [impRes, clkRes, campRes, evRes] = await Promise.all([
    supabase.from("analytics_impressions").select("created_at, campaign_id, url").gte("created_at", since),
    supabase.from("analytics_clicks").select("created_at, campaign_id, url").gte("created_at", since),
    supabase.from("campaigns").select("id, name").eq("user_id", user!.id),
    supabase.from("events").select("event_type").gte("created_at", since),
  ]);

  const impressions = impRes.data ?? [];
  const clicks = clkRes.data ?? [];
  const campaignName: Record<string, string> = {};
  (campRes.data ?? []).forEach((c) => { campaignName[c.id] = c.name; });

  const totalImp = impressions.length;
  const totalClk = clicks.length;

  const chartData = (() => {
    const i = bucketByDay(impressions, days);
    const c = bucketByDay(clicks, days);
    return days.map((d, idx) => ({ day: d, Impressions: i[idx], Clicks: c[idx] }));
  })();

  // per-campaign performance
  const impByCamp = countBy(impressions, "campaign_id");
  const clkByCamp = countBy(clicks, "campaign_id");
  const campIds = Array.from(new Set([...Object.keys(impByCamp), ...Object.keys(clkByCamp)])).filter((x) => x !== "—");
  const perf = campIds.map((id) => ({
    name: campaignName[id] ?? "Unknown",
    imp: impByCamp[id] || 0, clk: clkByCamp[id] || 0,
  })).sort((a, b) => b.imp - a.imp);

  const topUrls = topEntries(countBy(impressions, "url"), 5);
  const eventsByType = topEntries(countBy(evRes.data ?? [], "event_type"), 10);

  const empty = totalImp === 0 && totalClk === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <p className="-mt-3 text-sm text-slate-500">Last 30 days.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Impressions</p><p className="mt-1 text-2xl font-bold">{formatNumber(totalImp)}</p></Card>
        <Card><p className="text-sm text-slate-500">Clicks</p><p className="mt-1 text-2xl font-bold">{formatNumber(totalClk)}</p></Card>
        <Card><p className="text-sm text-slate-500">Click-through rate</p><p className="mt-1 text-2xl font-bold">{ctr(totalImp, totalClk)}%</p></Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">Daily impressions & clicks</h2>
        {empty ? (
          <p className="py-16 text-center text-sm text-slate-400">
            No data yet. Once your widget is live and showing popups, impressions and clicks land here.
          </p>
        ) : <AnalyticsChart data={chartData} />}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Campaign performance</h2>
          {perf.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No campaign activity yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2">Campaign</th><th className="pb-2 text-right">Impr.</th><th className="pb-2 text-right">Clicks</th><th className="pb-2 text-right">CTR</th>
              </tr></thead>
              <tbody>
                {perf.map((p) => (
                  <tr key={p.name} className="border-t border-slate-100">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2 text-right tabular-nums">{formatNumber(p.imp)}</td>
                    <td className="py-2 text-right tabular-nums">{formatNumber(p.clk)}</td>
                    <td className="py-2 text-right tabular-nums">{ctr(p.imp, p.clk)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Top pages</h2>
          {topUrls.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No page data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topUrls.map(([url, n]) => (
                <li key={url} className="flex items-center justify-between">
                  <span className="truncate text-slate-700">{url || "/"}</span>
                  <span className="tabular-nums text-slate-400">{formatNumber(n)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">Events by type</h2>
        {eventsByType.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No events recorded in the last 30 days.</p>
        ) : (
          <div className="space-y-2">
            {eventsByType.map(([type, n]) => {
              const max = eventsByType[0][1] || 1;
              return (
                <div key={type} className="flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 text-slate-600">{NOTIFICATION_LABELS[type as keyof typeof NOTIFICATION_LABELS] ?? type}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right tabular-nums text-slate-400">{n}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
