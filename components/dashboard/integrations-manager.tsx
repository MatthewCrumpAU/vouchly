"use client";

import { useState } from "react";
import { connectIntegration, disconnectIntegration } from "@/app/(dashboard)/integrations/actions";
import { Check, Copy, Plug, Zap } from "lucide-react";

const LABELS: Record<string, string> = {
  stripe: "Stripe", shopify: "Shopify", woocommerce: "WooCommerce", paypal: "PayPal",
  zapier: "Zapier", webhooks: "Custom webhook", mailchimp: "Mailchimp", convertkit: "ConvertKit",
  calendly: "Calendly", wordpress: "WordPress", "google-reviews": "Google Reviews",
  "facebook-reviews": "Facebook Reviews", trustpilot: "Trustpilot",
};

type Website = { id: string; name: string; site_key: string };
type Integration = { id: string; provider: string; website_id: string };

export function IntegrationsManager({
  providers, liveProviders, websites, integrations, appUrl,
}: { providers: string[]; liveProviders: string[]; websites: Website[]; integrations: Integration[]; appUrl: string }) {
  const [websiteId, setWebsiteId] = useState(websites[0]?.id ?? "");
  const [copied, setCopied] = useState<string | null>(null);
  const site = websites.find((w) => w.id === websiteId);

  const connectedFor = (provider: string) =>
    integrations.find((i) => i.provider === provider && i.website_id === websiteId);

  const copy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500); } catch {}
  };

  if (websites.length === 0) {
    return <div className="card"><p className="py-8 text-center text-sm text-slate-400">Add a website first to connect integrations.</p></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Website</span>
        <select value={websiteId} onChange={(e) => setWebsiteId(e.target.value)} className="input max-w-xs">
          {websites.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => {
          const live = liveProviders.includes(p);
          const conn = connectedFor(p);
          const url = `${appUrl}/api/integrations/${p}?siteKey=${site?.site_key ?? ""}`;
          return (
            <div key={p} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {live ? <Zap className="h-4 w-4 text-brand-600" /> : <Plug className="h-4 w-4 text-slate-300" />}
                  <h3 className="font-semibold">{LABELS[p] ?? p}</h3>
                </div>
                {conn ? <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">connected</span>
                  : !live ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">soon</span> : null}
              </div>

              {conn ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-slate-500">Send events to this URL:</p>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-slate-900 p-2 pr-8 font-mono text-[11px] text-slate-100">{url}</pre>
                    <button onClick={() => copy(url, p)} className="absolute right-1.5 top-1.5 rounded p-1 text-slate-300 hover:text-white">{copied === p ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}</button>
                  </div>
                  <form action={disconnectIntegration}>
                    <input type="hidden" name="id" value={conn.id} />
                    <button className="text-xs font-medium text-red-600 hover:underline">Disconnect</button>
                  </form>
                </div>
              ) : (
                <form action={connectIntegration} className="mt-3">
                  <input type="hidden" name="provider" value={p} />
                  <input type="hidden" name="website_id" value={websiteId} />
                  <button disabled={!live} className={`w-full rounded-lg px-3 py-1.5 text-sm font-medium ${live ? "bg-brand-600 text-white hover:bg-brand-700" : "cursor-not-allowed border border-slate-200 text-slate-400"}`}>
                    {live ? "Connect" : "Coming soon"}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
