"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { updateCampaign, type FormState } from "@/app/(dashboard)/actions";
import { CampaignPreview } from "./campaign-preview";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { NOTIFICATION_LABELS, type Campaign } from "@/lib/types";
import { ChevronLeft } from "lucide-react";

const initial: FormState = {};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between text-sm text-slate-700">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-brand-600" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? "left-4" : "left-0.5"}`} />
      </button>
    </label>
  );
}

export function CampaignEditor({ campaign }: { campaign: Campaign }) {
  const [state, formAction] = useFormState(updateCampaign, initial);

  const [name, setName] = useState(campaign.name);
  const [status, setStatus] = useState(campaign.status);
  const [type, setType] = useState(campaign.notification_type);
  const [position, setPosition] = useState(campaign.position);
  const [delay, setDelay] = useState(campaign.delay_seconds);
  const [duration, setDuration] = useState(campaign.duration_seconds);
  const [interval, setIntervalS] = useState(campaign.interval_seconds);
  const [maxPer, setMaxPer] = useState(campaign.max_per_session);
  const [showAll, setShowAll] = useState(campaign.show_all_pages);
  const [included, setIncluded] = useState((campaign.included_urls || []).join("\n"));
  const [excluded, setExcluded] = useState((campaign.excluded_urls || []).join("\n"));
  const [desktop, setDesktop] = useState(campaign.show_desktop);
  const [mobile, setMobile] = useState(campaign.show_mobile);
  const [branding, setBranding] = useState(campaign.branding);

  const d = campaign.design || ({} as any);
  const [bg, setBg] = useState(d.bg || "#ffffff");
  const [text, setText] = useState(d.text || "#0f172a");
  const [accent, setAccent] = useState(d.accent || "#4f46e5");
  const [radius, setRadius] = useState(d.radius ?? 12);
  const [shadow, setShadow] = useState(d.shadow ?? true);
  const [font, setFont] = useState(d.font || "system");
  const [animation, setAnimation] = useState(d.animation || "slide");
  const [closeButton, setCloseButton] = useState(d.closeButton ?? true);

  const c = campaign.content || ({} as any);
  const [headline, setHeadline] = useState(c.headline || "");
  const [message, setMessage] = useState(c.message || "");
  const [ctaText, setCtaText] = useState(c.cta?.text || "");
  const [ctaUrl, setCtaUrl] = useState(c.cta?.url || "");
  const [rating, setRating] = useState(c.rating || 5);

  const design = { bg, text, accent, radius, shadow, font, animation, closeButton };
  const content = { headline, message, cta: { text: ctaText, url: ctaUrl }, rating };

  const payload = useMemo(() => JSON.stringify({
    id: campaign.id, name, status, notification_type: type, position,
    delay_seconds: delay, duration_seconds: duration, interval_seconds: interval, max_per_session: maxPer,
    show_all_pages: showAll,
    included_urls: included.split("\n").map((s) => s.trim()).filter(Boolean),
    excluded_urls: excluded.split("\n").map((s) => s.trim()).filter(Boolean),
    show_desktop: desktop, show_mobile: mobile, branding,
    design, content,
  }), [campaign.id, name, status, type, position, delay, duration, interval, maxPer, showAll, included, excluded, desktop, mobile, branding, bg, text, accent, radius, shadow, font, animation, closeButton, headline, message, ctaText, ctaUrl, rating]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="payload" value={payload} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/campaigns" className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit campaign</h1>
        </div>
        <div className="flex items-center gap-3">
          <Alert kind="success">{state.success}</Alert>
          <SubmitButton>Save changes</SubmitButton>
        </div>
      </div>
      <Alert kind="error">{state.error}</Alert>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <Section title="Basics">
            <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
                  {Object.entries(NOTIFICATION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <Field label="Position">
              <select className="input" value={position} onChange={(e) => setPosition(e.target.value as any)}>
                <option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option>
                <option value="top-left">Top left</option><option value="top-right">Top right</option>
              </select>
            </Field>
          </Section>

          <Section title="Content">
            <Field label="Message (optional — overrides the default copy)">
              <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="{name} from {city} just bought {product}" />
            </Field>
            <p className="text-xs text-slate-400">Variables: {"{name} {city} {product} {count} {time}"}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA text"><input className="input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Shop now" /></Field>
              <Field label="CTA link"><input className="input" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://…" /></Field>
            </div>
            {type === "review" && (
              <Field label="Rating"><input type="number" min={1} max={5} className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))} /></Field>
            )}
          </Section>

          <Section title="Design">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Background"><input type="color" className="h-9 w-full rounded-lg border border-slate-300" value={bg} onChange={(e) => setBg(e.target.value)} /></Field>
              <Field label="Text"><input type="color" className="h-9 w-full rounded-lg border border-slate-300" value={text} onChange={(e) => setText(e.target.value)} /></Field>
              <Field label="Accent"><input type="color" className="h-9 w-full rounded-lg border border-slate-300" value={accent} onChange={(e) => setAccent(e.target.value)} /></Field>
            </div>
            <Field label={`Corner radius — ${radius}px`}>
              <input type="range" min={0} max={28} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Font">
                <select className="input" value={font} onChange={(e) => setFont(e.target.value as any)}>
                  <option value="system">System</option><option value="serif">Serif</option>
                  <option value="mono">Mono</option><option value="rounded">Rounded</option>
                </select>
              </Field>
              <Field label="Animation">
                <select className="input" value={animation} onChange={(e) => setAnimation(e.target.value as any)}>
                  <option value="slide">Slide</option><option value="fade">Fade</option><option value="bounce">Bounce</option>
                </select>
              </Field>
            </div>
            <Toggle checked={shadow} onChange={setShadow} label="Drop shadow" />
            <Toggle checked={closeButton} onChange={setCloseButton} label="Close button" />
            <Toggle checked={branding} onChange={setBranding} label="“via Vouch” branding" />
          </Section>

          <Section title="Display rules">
            <div className="grid grid-cols-4 gap-3">
              <Field label="Delay (s)"><input type="number" min={0} className="input" value={delay} onChange={(e) => setDelay(Number(e.target.value))} /></Field>
              <Field label="Show (s)"><input type="number" min={1} className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
              <Field label="Gap (s)"><input type="number" min={1} className="input" value={interval} onChange={(e) => setIntervalS(Number(e.target.value))} /></Field>
              <Field label="Max/session"><input type="number" min={1} className="input" value={maxPer} onChange={(e) => setMaxPer(Number(e.target.value))} /></Field>
            </div>
            <Toggle checked={showAll} onChange={setShowAll} label="Show on all pages" />
            {!showAll && (
              <Field label="Only show on URLs containing (one per line)">
                <textarea className="input min-h-[64px]" value={included} onChange={(e) => setIncluded(e.target.value)} placeholder="/pricing&#10;/checkout" />
              </Field>
            )}
            <Field label="Hide on URLs containing (one per line)">
              <textarea className="input min-h-[64px]" value={excluded} onChange={(e) => setExcluded(e.target.value)} placeholder="/admin" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Toggle checked={desktop} onChange={setDesktop} label="Desktop" />
              <Toggle checked={mobile} onChange={setMobile} label="Mobile" />
            </div>
          </Section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <CampaignPreview type={type as any} design={{ ...design, branding }} content={content} />
          <p className="mt-3 text-xs text-slate-400">Preview uses sample data. Real popups pull from your events and animate per the chosen style.</p>
        </div>
      </div>
    </form>
  );
}
