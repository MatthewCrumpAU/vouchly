import type { PlanTier } from "./plans";

export type EntityStatus = "active" | "inactive";

export type NotificationType =
  | "recent_purchase" | "recent_signup" | "recent_download" | "live_visitors"
  | "announcement" | "low_stock" | "countdown" | "review" | "page_visits" | "custom";

export type PopupPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";
export type PopupAnimation = "slide" | "fade" | "bounce";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanTier;
  is_admin: boolean;
  is_disabled: boolean;
  created_at: string;
}

export interface Website {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  site_key: string;
  status: EntityStatus;
  created_at: string;
}

export interface CampaignDesign {
  bg: string;
  text: string;
  accent: string;
  radius: number;
  shadow: boolean;
  font: string;
  animation: PopupAnimation;
  closeButton: boolean;
}

export interface CampaignContent {
  headline: string;
  message: string;
  cta: { text: string; url: string };
  icon: string | null;
  rating?: number;
}

export interface Campaign {
  id: string;
  user_id: string;
  website_id: string;
  name: string;
  notification_type: NotificationType;
  status: EntityStatus;
  position: PopupPosition;
  delay_seconds: number;
  duration_seconds: number;
  interval_seconds: number;
  max_per_session: number;
  show_all_pages: boolean;
  included_urls: string[];
  excluded_urls: string[];
  show_desktop: boolean;
  show_mobile: boolean;
  branding: boolean;
  design: CampaignDesign;
  content: CampaignContent;
  created_at: string;
}

export interface VouchEvent {
  id: string;
  website_id: string;
  campaign_id: string | null;
  event_type: NotificationType;
  name: string | null;
  email: string | null;
  city: string | null;
  country: string | null;
  product: string | null;
  value: number | null;
  url: string | null;
  is_manual: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  recent_purchase: "Recent purchase",
  recent_signup: "Recent signup",
  recent_download: "Recent download",
  live_visitors: "Live visitors",
  announcement: "Announcement",
  low_stock: "Low stock",
  countdown: "Countdown timer",
  review: "Review / rating",
  page_visits: "Page visits",
  custom: "Custom message",
};
