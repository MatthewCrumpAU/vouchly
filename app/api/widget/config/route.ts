import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFor, type PlanTier } from "@/lib/plans";

// GET /api/widget/config?siteKey=vch_xxx
// Public. Returns active campaigns + active events for the widget.
// Stops serving once the owner exceeds their plan's monthly impressions.
export async function GET(req: Request) {
  const siteKey = new URL(req.url).searchParams.get("siteKey");
  if (!siteKey) return json({ campaigns: [], events: [] }, 400);

  const admin = createAdminClient();
  const { data: site } = await admin
    .from("websites").select("id, user_id, status").eq("site_key", siteKey).single();
  if (!site || site.status !== "active") return json({ campaigns: [], events: [] });

  // Plan-limit gate.
  const [{ data: profile }, { data: used }] = await Promise.all([
    admin.from("profiles").select("plan, is_disabled, brand_name, brand_color, white_label").eq("id", site.user_id).single(),
    admin.rpc("current_month_impressions", { p_user: site.user_id }),
  ]);
  if (profile?.is_disabled) return json({ campaigns: [], events: [] });
  const limit = planFor((profile?.plan ?? "free") as PlanTier).impressions;
  if (limit !== -1 && (used ?? 0) >= limit) return json({ campaigns: [], events: [], limited: true });

  const [{ data: campaigns }, { data: events }] = await Promise.all([
    admin.from("campaigns")
      .select(`id, name, notification_type, position,
               delay_seconds, duration_seconds, interval_seconds, max_per_session,
               show_all_pages, included_urls, excluded_urls, show_desktop, show_mobile,
               branding, design, content`)
      .eq("website_id", site.id).eq("status", "active"),
    admin.from("events")
      .select("id, campaign_id, event_type, name, city, country, product, metadata, created_at")
      .eq("website_id", site.id).eq("is_active", true)
      .order("created_at", { ascending: false }).limit(100),
  ]);

  const wl = profile?.white_label && planFor((profile?.plan ?? "free") as PlanTier).whiteLabel && profile?.brand_name;
  const brand = wl ? { name: profile!.brand_name, color: profile!.brand_color } : { name: "Vouch", color: null };

  return json({ campaigns: campaigns ?? [], events: events ?? [], brand });
}

export async function OPTIONS() { return json({}, 204); }

function json(body: unknown, status = 200) {
  return new NextResponse(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
  });
}
