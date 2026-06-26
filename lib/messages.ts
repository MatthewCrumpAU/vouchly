import type { NotificationType } from "./types";

export interface NoticeSource {
  event_type?: NotificationType | string;
  name?: string | null;
  city?: string | null;
  product?: string | null;
  message?: string | null;
  count?: number | null;
  rating?: number | null;
}

// Default copy per notification type. Used when a campaign has no custom
// content.message. Mirrors the templating in public/widget.js so dashboard
// previews match what visitors actually see.
export function buildNotice(type: string, ev: NoticeSource): string {
  const name = ev.name || "Someone";
  const city = ev.city ? ` from ${ev.city}` : "";
  const product = ev.product || "a product";
  switch (type) {
    case "recent_purchase": return `${name}${city} just purchased ${product}`;
    case "recent_signup": return `${name}${city} just signed up`;
    case "recent_download": return `${name} just downloaded ${product}`;
    case "live_visitors": return `${ev.count ?? 0} people are viewing this page right now`;
    case "low_stock": return `Only ${ev.count ?? 0} spots left`;
    case "page_visits": return `${ev.count ?? 0} people viewed this page today`;
    case "review": return `${name} gave us a ${ev.rating ?? 5}-star review`;
    case "announcement":
    case "custom": return ev.message || "";
    default: return `${name}${city}`;
  }
}
