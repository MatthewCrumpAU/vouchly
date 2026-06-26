import Link from "next/link";
import { PLANS, PUBLIC_PLANS } from "@/lib/plans";

const proofExamples = [
  "Sarah from Sydney just purchased Content Creator Elite",
  "24 people are viewing this page right now",
  "Only 3 spots left",
  "John gave us a 5-star review",
];

const audiences = ["Creators", "SaaS", "Ecommerce", "Agencies", "Coaches", "Funnel builders"];

const features = [
  { title: "Recent activity", body: "Show real purchases, signups and downloads as they happen." },
  { title: "Live visitors", body: "Display how many people are viewing a page right now." },
  { title: "Urgency & scarcity", body: "Low-stock alerts and countdown timers that drive action." },
  { title: "Reviews & ratings", body: "Surface 5-star reviews as social proof at the right moment." },
  { title: "Announcements", body: "Push offers and updates without touching your codebase." },
  { title: "One-line install", body: "Drop in a single script tag. Works on any website." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">V</div>
          <span className="text-lg font-bold">Vouch</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#features" className="hidden text-slate-600 hover:text-slate-900 sm:block">Features</Link>
          <Link href="#pricing" className="hidden text-slate-600 hover:text-slate-900 sm:block">Pricing</Link>
          <Link href="/login" className="font-medium text-slate-700 hover:text-slate-900">Log in</Link>
          <Link href="/signup" className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-12 text-center">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Social proof that converts
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Turn live activity into <span className="text-brand-600">trust and sales</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Show purchases, signups, reviews, live visitors, stock levels, timers and announcements
          on your website. Install with one script — no code required.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
            Start free
          </Link>
          <Link href="#pricing" className="rounded-lg border border-slate-300 px-6 py-3 font-semibold hover:bg-slate-50">
            See pricing
          </Link>
        </div>

        {/* Live proof mock */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
          {proofExamples.map((p) => (
            <div key={p} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">✓</div>
              <div>
                <p className="text-sm font-medium text-slate-800">{p}</p>
                <p className="text-xs text-slate-400">a few seconds ago · via Vouch</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-center text-sm font-medium uppercase tracking-wide text-slate-400">Built for</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-600">
          {audiences.map((a) => <span key={a} className="font-semibold">{a}</span>)}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">Everything you need to build momentum</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Install */}
      <section className="mx-auto max-w-3xl px-6 py-8 text-center">
        <h2 className="text-2xl font-bold">Install in one line</h2>
        <p className="mt-2 text-slate-600">Paste this before <code className="rounded bg-slate-100 px-1">&lt;/body&gt;</code> on any site.</p>
        <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-left text-sm text-slate-100">
{`<script src="https://your-vouch-app.com/widget.js"
  data-site-key="vch_your_public_key"></script>`}
        </pre>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
        <p className="mt-2 text-center text-slate-600">Start free. Upgrade as you grow.</p>
        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {PUBLIC_PLANS.map((key) => {
            const p = PLANS[key];
            const popular = key === "pro";
            return (
              <div key={key}
                className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm ${popular ? "border-brand-500 ring-2 ring-brand-500/30" : "border-slate-200"}`}>
                {popular && <span className="mb-2 inline-block w-fit rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">Most popular</span>}
                <h3 className="text-lg font-bold">{p.label}</h3>
                <p className="mt-2 text-3xl font-extrabold">${p.priceMonthly}<span className="text-base font-medium text-slate-400">/mo</span></p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  <li>{p.websites === -1 ? "Unlimited" : p.websites} website{p.websites === 1 ? "" : "s"}</li>
                  <li>{p.campaigns === -1 ? "Unlimited" : p.campaigns} campaign{p.campaigns === 1 ? "" : "s"}</li>
                  <li>{p.impressions.toLocaleString()} impressions/mo</li>
                  <li>{p.removeBranding ? "No Vouch branding" : "Vouch branding"}</li>
                  {p.whiteLabel && <li>White label + client accounts</li>}
                </ul>
                <Link href="/signup" className={`mt-6 rounded-lg px-4 py-2 text-center font-medium ${popular ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-slate-300 hover:bg-slate-50"}`}>
                  {p.priceMonthly === 0 ? "Start free" : "Choose " + p.label}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to add social proof?</h2>
        <p className="mx-auto mt-3 max-w-xl px-6 text-brand-100">Set up your first campaign in minutes.</p>
        <Link href="/signup" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50">
          Get started free
        </Link>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Vouch. Built with Next.js + Supabase.
      </footer>
    </main>
  );
}
