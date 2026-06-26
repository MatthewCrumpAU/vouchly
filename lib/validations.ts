import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const websiteSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  domain: z
    .string()
    .min(1, "Domain is required")
    .transform((d) => d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim())
    .pipe(z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Enter a valid domain")),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const notificationType = z.enum([
  "recent_purchase", "recent_signup", "recent_download", "live_visitors",
  "announcement", "low_stock", "countdown", "review", "page_visits", "custom",
]);

export const campaignSchema = z.object({
  website_id: z.string().uuid("Select a website"),
  name: z.string().min(1, "Campaign name is required").max(80),
  notification_type: notificationType.default("recent_purchase"),
  status: z.enum(["active", "inactive"]).default("active"),
  position: z.enum(["bottom-left", "bottom-right", "top-left", "top-right"]).default("bottom-left"),
  delay_seconds: z.coerce.number().int().min(0).max(120).default(3),
  duration_seconds: z.coerce.number().int().min(1).max(120).default(6),
  interval_seconds: z.coerce.number().int().min(1).max(600).default(8),
  max_per_session: z.coerce.number().int().min(1).max(200).default(20),
  show_desktop: z.coerce.boolean().default(true),
  show_mobile: z.coerce.boolean().default(true),
});

export const eventSchema = z.object({
  siteKey: z.string().optional(),
  website_id: z.string().uuid().optional(),
  campaign_id: z.string().uuid().optional(),
  event_type: notificationType.default("recent_purchase"),
  name: z.string().optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  product: z.string().optional(),
  value: z.coerce.number().optional(),
  url: z.string().optional(),
  is_manual: z.coerce.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const manualEventSchema = z.object({
  website_id: z.string().uuid("Select a website"),
  event_type: notificationType.default("recent_purchase"),
  name: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  product: z.string().max(120).optional(),
  message: z.string().max(200).optional(),
  count: z.coerce.number().int().min(0).optional(),
  minutes_ago: z.coerce.number().int().min(0).max(60 * 24 * 30).default(2),
  is_active: z.coerce.boolean().default(true),
});

export const designSchema = z.object({
  bg: z.string().default("#ffffff"),
  text: z.string().default("#0f172a"),
  accent: z.string().default("#4f46e5"),
  radius: z.coerce.number().int().min(0).max(40).default(12),
  shadow: z.coerce.boolean().default(true),
  font: z.enum(["system", "serif", "mono", "rounded"]).default("system"),
  animation: z.enum(["slide", "fade", "bounce"]).default("slide"),
  closeButton: z.coerce.boolean().default(true),
});

export const contentSchema = z.object({
  headline: z.string().max(120).default(""),
  message: z.string().max(240).default(""),
  cta: z.object({ text: z.string().max(40).default(""), url: z.string().max(400).default("") }).default({ text: "", url: "" }),
  rating: z.coerce.number().int().min(1).max(5).default(5),
});

export const campaignUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  status: z.enum(["active", "inactive"]),
  notification_type: notificationType,
  position: z.enum(["bottom-left", "bottom-right", "top-left", "top-right"]),
  delay_seconds: z.coerce.number().int().min(0).max(120),
  duration_seconds: z.coerce.number().int().min(1).max(120),
  interval_seconds: z.coerce.number().int().min(1).max(600),
  max_per_session: z.coerce.number().int().min(1).max(200),
  show_all_pages: z.coerce.boolean(),
  included_urls: z.array(z.string()).default([]),
  excluded_urls: z.array(z.string()).default([]),
  show_desktop: z.coerce.boolean(),
  show_mobile: z.coerce.boolean(),
  branding: z.coerce.boolean(),
  design: designSchema,
  content: contentSchema,
});
