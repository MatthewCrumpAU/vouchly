import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/widget/click  { siteKey, campaignId, url }
export async function POST(req: Request) {
  const { siteKey, campaignId, url } = await req.json().catch(() => ({}));
  if (!siteKey) return NextResponse.json({ error: "Missing siteKey" }, { status: 400 });
  const admin = createAdminClient();
  const { data: site } = await admin.from("websites").select("id").eq("site_key", siteKey).single();
  if (!site) return NextResponse.json({ error: "Unknown site" }, { status: 404 });
  await admin.from("analytics_clicks").insert({ website_id: site.id, campaign_id: campaignId ?? null, url });
  return NextResponse.json({ ok: true });
}
