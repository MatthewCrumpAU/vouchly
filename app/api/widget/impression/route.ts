import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/widget/impression  { siteKey, campaignId, url }
export async function POST(req: Request) {
  const { siteKey, campaignId, url } = await req.json().catch(() => ({}));
  if (!siteKey) return cors({ error: "Missing siteKey" }, 400);

  const admin = createAdminClient();
  const { data: site } = await admin.from("websites").select("id").eq("site_key", siteKey).single();
  if (!site) return cors({ error: "Unknown site" }, 404);

  await admin.from("analytics_impressions").insert({ website_id: site.id, campaign_id: campaignId ?? null, url });
  await admin.rpc("bump_impression", { p_website: site.id });

  return cors({ ok: true });
}

export async function OPTIONS() { return cors({}, 204); }

function cors(body: unknown, status = 200) {
  return new NextResponse(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
