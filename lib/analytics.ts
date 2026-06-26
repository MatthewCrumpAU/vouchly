// Aggregation helpers for the analytics dashboard. We pull raw rows (RLS keeps
// them scoped to the user) and bucket them here — simple and good enough for
// MVP volumes; swap to SQL date_trunc rollups when traffic grows.

export interface Row { created_at: string; campaign_id: string | null; url: string | null }

export function ctr(impressions: number, clicks: number): string {
  return impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";
}

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(d);
    day.setDate(d.getDate() - i);
    out.push(day.toISOString().slice(0, 10));
  }
  return out;
}

export function bucketByDay(rows: Row[], days: string[]): number[] {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const k = r.created_at.slice(0, 10);
    counts[k] = (counts[k] || 0) + 1;
  }
  return days.map((d) => counts[d] || 0);
}

export function countBy<T extends string | null>(rows: { [k: string]: any }[], key: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = r[key] ?? "—";
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

export function topEntries(map: Record<string, number>, n: number): [string, number][] {
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
}
