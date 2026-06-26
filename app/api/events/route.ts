import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventSchema } from "@/lib/validations";

// POST /api/events
// Public ingestion endpoint. Accepts events from site forms, manual dashboard
// entries, integrations and webhooks. Resolves the website by `siteKey`.
// NOTE: Phase 2 will add rate limiting + signature verification.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const admin = createAdminClient();
  let websiteId = parsed.data.website_id;

  if (!websiteId && parsed.data.siteKey) {
    const { data: site } = await admin
      .from("websites").select("id").eq("site_key", parsed.data.siteKey).single();
    websiteId = site?.id;
  }
  if (!websiteId) {
    return NextResponse.json({ error: "Unknown site" }, { status: 404 });
  }

  const { error } = await admin.from("events").insert({
    website_id: websiteId,
    campaign_id: parsed.data.campaign_id ?? null,
    event_type: parsed.data.event_type,
    name: parsed.data.name,
    email: parsed.data.email,
    city: parsed.data.city,
    country: parsed.data.country,
    product: parsed.data.product,
    value: parsed.data.value,
    url: parsed.data.url,
    is_manual: parsed.data.is_manual,
    metadata: parsed.data.metadata ?? {},
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
