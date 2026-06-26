import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROVIDERS } from "@/lib/integrations/registry";

// POST /api/integrations/:provider?siteKey=vch_xxx
// Inbound integration webhook → normalised Vouch events.
export async function POST(req: Request, { params }: { params: { provider: string } }) {
  const provider = PROVIDERS[params.provider];
  if (!provider) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });

  const siteKey = new URL(req.url).searchParams.get("siteKey");
  if (!siteKey) return NextResponse.json({ error: "Missing siteKey" }, { status: 400 });

  const payload = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  const { data: site } = await admin.from("websites").select("id").eq("site_key", siteKey).single();
  if (!site) return NextResponse.json({ error: "Unknown site" }, { status: 404 });

  const events = await provider.parseWebhook(payload);
  if (!events.length) return NextResponse.json({ ok: true, inserted: 0 });

  const rows = events.map((e) => ({
    website_id: site.id,
    event_type: e.event_type ?? "custom",
    name: e.name ?? null, email: e.email ?? null, city: e.city ?? null, country: e.country ?? null,
    product: e.product ?? null, value: e.value ?? null, url: e.url ?? null,
    is_manual: false, is_active: true, metadata: e.metadata ?? {},
  }));
  const { error } = await admin.from("events").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: rows.length });
}
