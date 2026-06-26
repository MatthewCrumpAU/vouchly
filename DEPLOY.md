# Deploying Vouch — Supabase + Vercel + Stripe

A step-by-step checklist to take Vouch live. Plan ~30–40 minutes.

---

## 0. What you need
- A [Supabase](https://supabase.com) account (free tier is fine to start)
- A [Vercel](https://vercel.com) account (free Hobby tier is fine)
- A [Stripe](https://stripe.com) account (optional — only for paid plans)
- This project pushed to a GitHub repo (recommended) **or** the Vercel CLI installed

---

## 1. Create the Supabase project
1. supabase.com → **New project**. Pick a name, a strong database password, and a region close to your users.
2. Wait for it to finish provisioning (~2 min).

## 2. Run the database schema
In the Supabase dashboard → **SQL Editor** → **New query**, run these files **in order**, one at a time (each "Run"):
1. `supabase/schema.sql`               ← tables, enums, RLS policies, the new-user trigger
2. `supabase/migrations/0002_phase2_events.sql`
3. `supabase/migrations/0003_phase3_usage.sql`
4. `supabase/migrations/0004_phase4_billing_agency.sql`
5. `supabase/migrations/0005_owner_lifetime.sql`   ← **run this one by itself**

> Postgres can't add an enum value and use it in the same transaction, so 0005 must run alone before anything references the `lifetime` plan.

(Optional) Seed demo data: run `supabase/seed.sql` and `supabase/seed_analytics.sql`.

## 3. Grab your Supabase keys
Dashboard → **Project Settings → API**. Copy:
- **Project URL**            → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key**      → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key**       → `SUPABASE_SERVICE_ROLE_KEY`  (keep secret — server only)

## 4. Configure auth redirect URLs
Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app` (you'll get this in step 6; come back and set it)
- **Redirect URLs**: add `https://your-app.vercel.app/auth/callback`

---

## 5. Push the code
Easiest path is GitHub:
```bash
git init && git add . && git commit -m "Vouch"
# create a repo on github.com, then:
git remote add origin https://github.com/you/vouch.git
git push -u origin main
```

## 6. Deploy to Vercel
1. vercel.com → **Add New → Project** → import your GitHub repo (it auto-detects Next.js).
2. Before clicking Deploy, open **Environment Variables** and add the values from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`  = your Vercel URL, e.g. `https://your-app.vercel.app`
   - (Stripe vars below — add later if you're doing billing)
3. **Deploy.** You'll get a `https://your-app.vercel.app` URL.
4. Go back to **step 4** and put that real URL into Supabase's Site URL + Redirect URLs.

> No-GitHub alternative: `npm i -g vercel` then run `vercel` in the project folder and follow the prompts; add the env vars with `vercel env add` or in the dashboard, then `vercel --prod`.

---

## 7. Make yourself the owner (unlimited Lifetime account)
1. Open your deployed app and **sign up** with your email (this creates your `profiles` row).
2. In Supabase **SQL Editor**, open `supabase/make_me_owner.sql`, change the email to yours, and run it.
   This sets `plan = lifetime`, `is_admin = true`, `white_label = true` — unlimited usage, the Admin panel, and white-label unlocked.
3. Log out and back in. You'll see "Lifetime" in Settings and the Admin/Clients/Integrations sections.

---

## 8. (Optional) Stripe billing
1. Stripe Dashboard → create **Products/Prices** for Starter, Pro, Agency (monthly).
2. Copy each Price ID into your Vercel env vars:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`  (from step 4 below)
   - `NEXT_PUBLIC_STRIPE_PRICE_STARTER`, `..._PRO`, `..._AGENCY`
3. Redeploy so the new env vars take effect.
4. Stripe → **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`, then redeploy once more.

---

## 9. Install the widget on a site
In the dashboard → **Websites**, copy the snippet and paste it before `</body>` on any site:
```html
<script src="https://your-app.vercel.app/widget.js" data-site-key="vch_xxx"></script>
```
Create a campaign, add some Activity, and the popups appear. Done.

---

## Troubleshooting
- **Login redirect fails** → the Site URL / Redirect URL in Supabase don't match your Vercel domain exactly (https, no trailing slash).
- **Widget loads but nothing shows** → the campaign is inactive, has no active events, or you've hit the plan's monthly impression cap (owners are unlimited).
- **"lifetime" enum error** → migration 0005 wasn't run on its own before `make_me_owner.sql`.
- **Stripe webhook 400** → `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint's signing secret; re-copy and redeploy.
