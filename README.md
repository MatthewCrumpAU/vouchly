# Vouch

A Provely-style **social proof & urgency popup SaaS**. Add a single script to any
website to show purchases, signups, reviews, live visitors, stock alerts,
countdowns and announcements.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind · Supabase**.
Stripe-ready, Vercel-ready.

> This repo currently implements **Phase 1** end-to-end (auth, dashboard,
> websites, campaigns) plus the full database schema and working API/widget
> scaffolding for Phase 2. See "Build status" below.

---

## Quick start

### 1. Install
```bash
npm install
```

### 2. Create a Supabase project
- Go to https://supabase.com → New project.
- In **Project Settings → API**, copy the Project URL, the `anon` key, and the
  `service_role` key.

### 3. Run the database schema
- Open the Supabase **SQL Editor**.
- Paste and run `supabase/schema.sql` (tables, RLS, triggers).
- Then run `supabase/seed.sql` (system notification templates).

### 4. Environment variables
```bash
cp .env.example .env.local
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only, bypasses RLS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Auth settings (optional but recommended for local dev)
In Supabase → **Authentication → Providers → Email**, you can turn **"Confirm
email" OFF** for faster local testing (sign up logs you straight in). With it
on, users confirm via the link, which routes through `/auth/callback`.

Add `http://localhost:3000/**` to **Authentication → URL Configuration →
Redirect URLs**.

### 6. Run
```bash
npm run dev
```
Open http://localhost:3000.

---

## Testing the widget

1. Sign up, add a **website** (Dashboard → Websites) and copy its install snippet.
2. Create a **campaign** for that website (Dashboard → Campaigns).
3. Add a few events. Quickest way for now — POST to the public endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/events \
     -H "Content-Type: application/json" \
     -d '{"siteKey":"vch_xxx","event_type":"recent_purchase","name":"Sarah","city":"Sydney","product":"Content Creator Elite","is_manual":true}'
   ```
4. Open `public/test.html` — edit the `data-site-key` to your real key — and
   serve it (e.g. `npx serve public`) or just open the file. Popups appear.

The widget uses **shadow DOM** so it never inherits or breaks host-page styles,
loads asynchronously, and fails silently if the API is unreachable.

---

## Project structure
```
app/
  (auth)/            login, signup, forgot/reset password, server actions
  (dashboard)/       layout + sidebar, overview, websites, campaigns, + placeholders
  api/
    events/          POST /api/events  (public ingestion)
    widget/          config | impression | click  (public, service-role)
  auth/callback/     email-confirm / reset exchange
components/          ui/ + dashboard/ + landing/
lib/
  supabase/          client | server | admin (service role) | middleware
  integrations/      typed placeholders for Stripe, Shopify, Zapier, etc.
  plans.ts           plan tiers + limit checks
  types.ts           domain types
  validations.ts     Zod schemas
public/
  widget.js          embeddable widget
  test.html          local test harness
supabase/
  schema.sql         tables, enums, RLS, triggers
  seed.sql           system templates (+ optional demo data)
middleware.ts        session refresh + route protection
```

---

## Plans & limits
Defined in `lib/plans.ts` and enforced in server actions
(`canAddWebsite`, `canAddCampaign`, `withinImpressionLimit`):

| Plan    | Websites  | Campaigns | Impressions/mo | Branding |
|---------|-----------|-----------|----------------|----------|
| Free    | 1         | 1         | 1,000          | Yes      |
| Starter | 3         | 10        | 50,000         | No       |
| Pro     | 10        | Unlimited | 250,000        | No       |
| Agency  | Unlimited | Unlimited | 1,000,000      | No (white-label) |

---

## Theming
The whole app's accent comes from the `brand.*` tokens in `tailwind.config.ts`.
The spec asked for a blue/purple style, so that's the default. To switch to a
different accent (e.g. green `#16a34a`), change those tokens in one place.

---

## Build status

**Phase 1 — done**
- Next.js + Supabase SSR auth (signup, login, logout, forgot/reset, protected routes)
- Dashboard layout + sidebar, overview cards, recent activity
- Website management with generated site keys + install snippet
- Campaign builder with display rules + plan-limit enforcement
- Full schema with RLS, triggers, plan/usage/integration/api-key tables

**Phase 2 — done**
- Events system: `POST /api/events` ingestion + manual entries from the dashboard
- **Manual Activity Manager** (`/activity`): per-website, type-aware add form
  (purchase/signup/review take name/city/product; visitors/stock take a count;
  announcements take a message), "shown as N minutes ago", active/inactive
  toggle, delete. Stored as `is_manual` events; counts/messages live in `metadata`.
- Hardened widget config API: returns only active campaigns + active events,
  render-safe fields only (no emails/values/ids), with CORS
- Full **`widget.js`**: shadow DOM, multi-campaign round-robin rotation,
  URL targeting (all pages / included / excluded), desktop-vs-mobile rules,
  per-session caps (sessionStorage), slide/fade/bounce animations, design
  tokens (bg/text/accent/radius/shadow), CTA click-through, close button,
  branding line, impression + click tracking, and total graceful-failure
  isolation (never throws on a host page)

> Run the Phase 2 migration before testing: `supabase/migrations/0002_phase2_events.sql`
> (adds `events.is_active`). Fresh installs of `schema.sql` already include it.

**Phase 3 — done**
- **Analytics** (`/analytics`): 30-day impressions/clicks/CTR cards, a daily
  line chart (recharts), per-campaign performance table, top pages, and an
  events-by-type breakdown. Demo data: `supabase/seed_analytics.sql`.
- **Campaign customization editor** (`/campaigns/[id]`): live-preview editor
  wired to the campaign's `design` (bg/text/accent/radius/shadow/font/animation/
  close button) and `content` (message with `{variables}`, CTA, rating), plus
  all display rules (position, timing, URL targeting, device, branding).
- **Plan limits**: monthly impression counting (`bump_impression`) with the
  widget config endpoint refusing to serve once a plan's cap is hit; Settings
  page shows live usage-vs-limit bars per resource.
- **Admin panel** (`/admin`): `is_admin`-gated platform stats + user table with
  one-click disable/enable (disabled accounts stop serving widgets immediately).

> Phase 3 needs migration `supabase/migrations/0003_phase3_usage.sql`.

**Phase 4 — done**
- **Stripe billing**: checkout + billing-portal server actions, a signed
  webhook (`/api/stripe/webhook`) that syncs `subscriptions` + `profiles.plan`
  on subscribe/update/cancel, and Settings upgrade/manage buttons wired to it.
  Set keys + `STRIPE_PRICE_*` env vars to go live; without them, buttons show a
  friendly "not configured" notice.
- **Integrations** (`/integrations`, Pro+): live Stripe / Zapier / custom-webhook
  parsers (`lib/integrations/*`) feeding a generic inbound endpoint
  `/api/integrations/:provider?siteKey=…` that normalises payloads into events.
  Connect/disconnect per website with a copyable webhook URL; the other 10
  providers render as "coming soon".
- **Agency / white-label**: white-label branding (Settings → replaces "via Vouch"
  in the widget with your brand name/color; the config endpoint serves it),
  and client workspaces (`/clients`, Agency-only) — create clients and assign
  websites. New `clients` table + `websites.client_id`.

> Phase 4 needs migration `0004_phase4_billing_agency.sql`. Stripe webhook:
> point a Stripe endpoint at `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.

That's all four phases. Vouch is feature-complete against the spec.

---

## Deploy to Vercel
```bash
vercel
```
Set the same env vars in the Vercel project settings. Update
`NEXT_PUBLIC_APP_URL` to your production URL so install snippets and the widget
point at the right origin.
