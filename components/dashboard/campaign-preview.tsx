"use client";

import { ShoppingBag, UserPlus, Download, Eye, Megaphone, Flame, Clock, Star, MousePointerClick, MessageSquare, X } from "lucide-react";
import type { NotificationType } from "@/lib/types";

const ICONS: Record<string, any> = {
  recent_purchase: ShoppingBag, recent_signup: UserPlus, recent_download: Download,
  live_visitors: Eye, announcement: Megaphone, low_stock: Flame, countdown: Clock,
  review: Star, page_visits: MousePointerClick, custom: MessageSquare,
};
const FONTS: Record<string, string> = {
  system: "system-ui, sans-serif", serif: "Georgia, serif",
  mono: "ui-monospace, monospace", rounded: "ui-rounded, system-ui, sans-serif",
};

const SAMPLE = { name: "Sarah", city: "Sydney", product: "Content Creator Elite", count: 24 };

function fill(t: string, ctx: Record<string, any>) {
  return t.replace(/{(\w+)}/g, (_, k) => (ctx[k] != null ? ctx[k] : ""));
}
function defaultCopy(type: string, c: any) {
  const who = `${c.name}${c.city ? " from " + c.city : ""}`;
  switch (type) {
    case "recent_purchase": return `${who} just purchased ${c.product}`;
    case "recent_signup": return `${who} just signed up`;
    case "recent_download": return `${c.name} just downloaded ${c.product}`;
    case "live_visitors": return `${c.count} people are viewing this page right now`;
    case "low_stock": return `Only ${c.count} spots left`;
    case "page_visits": return `${c.count} people viewed this page today`;
    case "review": return `${c.name} gave us a ${c.rating}-star review`;
    case "countdown": return `02:59:14 remaining`;
    default: return who;
  }
}

export function CampaignPreview({ type, design, content }: { type: NotificationType; design: any; content: any }) {
  const Icon = ICONS[type] || MessageSquare;
  const ctx = { ...SAMPLE, rating: content.rating || 5 };
  const msg = content.message ? fill(content.message, ctx) : defaultCopy(type, ctx);

  return (
    <div className="relative h-[260px] overflow-hidden rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_20%_20%,#f8fafc,#eef2f7)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Live preview</p>
      <div className="absolute bottom-5 left-5">
        <div
          style={{ background: design.bg, color: design.text, borderRadius: design.radius, fontFamily: FONTS[design.font] || FONTS.system, boxShadow: design.shadow ? "0 12px 40px rgba(15,23,42,0.18)" : "none" }}
          className="flex max-w-[320px] items-center gap-3 px-3.5 py-3 ring-1 ring-black/5"
        >
          <div style={{ background: design.accent }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-snug">{msg}</p>
            {type === "review" && (
              <div className="mt-0.5 flex gap-0.5">
                {Array.from({ length: content.rating || 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
              </div>
            )}
            <p className="mt-0.5 text-[11px] text-slate-400">
              2 minutes ago{design.branding !== false ? <span className="text-slate-300"> · via Vouch</span> : null}
            </p>
          </div>
          {design.closeButton !== false && <X className="ml-1 h-4 w-4 self-start text-slate-300" />}
        </div>
      </div>
    </div>
  );
}
