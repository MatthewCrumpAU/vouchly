-- =====================================================================
-- VOUCH — Database schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
do $$ begin
  create type plan_tier as enum ('free', 'starter', 'pro', 'agency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type entity_status as enum ('active', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'recent_purchase', 'recent_signup', 'recent_download', 'live_visitors',
    'announcement', 'low_stock', 'countdown', 'review', 'page_visits', 'custom'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type popup_position as enum ('bottom-left','bottom-right','top-left','top-right');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- PROFILES (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  plan        plan_tier not null default 'free',
  is_admin    boolean not null default false,
  is_disabled boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- WEBSITES
-- ---------------------------------------------------------------------
create table if not exists public.websites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  domain      text not null,
  site_key    text not null unique default ('vch_' || replace(gen_random_uuid()::text, '-', '')),
  status      entity_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists websites_user_id_idx on public.websites(user_id);
create index if not exists websites_site_key_idx on public.websites(site_key);

-- ---------------------------------------------------------------------
-- CAMPAIGNS
-- ---------------------------------------------------------------------
create table if not exists public.campaigns (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  website_id        uuid not null references public.websites(id) on delete cascade,
  name              text not null,
  notification_type notification_type not null default 'recent_purchase',
  status            entity_status not null default 'active',
  position          popup_position not null default 'bottom-left',
  delay_seconds     int not null default 3,
  duration_seconds  int not null default 6,
  interval_seconds  int not null default 8,
  max_per_session   int not null default 20,
  show_all_pages    boolean not null default true,
  included_urls     text[] not null default '{}',
  excluded_urls     text[] not null default '{}',
  show_desktop      boolean not null default true,
  show_mobile       boolean not null default true,
  branding          boolean not null default true,  -- show "Powered by Vouch" (free plans)
  -- look & feel (background, text, accent, radius, shadow, font, animation, close btn, cta)
  design            jsonb not null default '{
    "bg":"#ffffff","text":"#0f172a","accent":"#4f46e5","radius":12,
    "shadow":true,"font":"system","animation":"slide","closeButton":true
  }'::jsonb,
  -- default content / template variables for this campaign
  content           jsonb not null default '{
    "headline":"","message":"","cta":{"text":"","url":""},"icon":null
  }'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists campaigns_user_id_idx on public.campaigns(user_id);
create index if not exists campaigns_website_id_idx on public.campaigns(website_id);

-- ---------------------------------------------------------------------
-- NOTIFICATION TEMPLATES (system presets, readable by everyone)
-- ---------------------------------------------------------------------
create table if not exists public.notification_templates (
  id              uuid primary key default gen_random_uuid(),
  type            notification_type not null,
  name            text not null,
  description     text,
  default_content jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- EVENTS  (real + manual; is_manual flags hand-entered starter notices)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  website_id  uuid not null references public.websites(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  event_type  notification_type not null default 'recent_purchase',
  name        text,
  email       text,
  city        text,
  country     text,
  product     text,
  value       numeric,
  url         text,
  is_manual   boolean not null default false,
  is_active   boolean not null default true,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists events_website_id_idx on public.events(website_id);
create index if not exists events_campaign_id_idx on public.events(campaign_id);
create index if not exists events_created_at_idx on public.events(created_at desc);

-- ---------------------------------------------------------------------
-- ANALYTICS
-- ---------------------------------------------------------------------
create table if not exists public.analytics_impressions (
  id          uuid primary key default gen_random_uuid(),
  website_id  uuid not null references public.websites(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  url         text,
  created_at  timestamptz not null default now()
);
create index if not exists impressions_website_idx on public.analytics_impressions(website_id, created_at desc);
create index if not exists impressions_campaign_idx on public.analytics_impressions(campaign_id);

create table if not exists public.analytics_clicks (
  id          uuid primary key default gen_random_uuid(),
  website_id  uuid not null references public.websites(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  url         text,
  created_at  timestamptz not null default now()
);
create index if not exists clicks_website_idx on public.analytics_clicks(website_id, created_at desc);
create index if not exists clicks_campaign_idx on public.analytics_clicks(campaign_id);

-- ---------------------------------------------------------------------
-- SUBSCRIPTIONS (Stripe-ready; not wired in Phase 1)
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  plan                   plan_tier not null default 'free',
  status                 text not null default 'active',
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id)
);

-- ---------------------------------------------------------------------
-- USAGE (monthly counters for plan-limit enforcement)
-- ---------------------------------------------------------------------
create table if not exists public.usage_limits (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  period_start     date not null default date_trunc('month', now())::date,
  impressions_used int not null default 0,
  created_at       timestamptz not null default now(),
  unique (user_id, period_start)
);

-- ---------------------------------------------------------------------
-- INTEGRATIONS (placeholder rows for Stripe/Shopify/Zapier/etc.)
-- ---------------------------------------------------------------------
create table if not exists public.integrations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  website_id  uuid references public.websites(id) on delete cascade,
  provider    text not null,
  status      entity_status not null default 'inactive',
  config      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists integrations_user_idx on public.integrations(user_id);

-- ---------------------------------------------------------------------
-- API KEYS (server-to-server; separate from public site_key)
-- ---------------------------------------------------------------------
create table if not exists public.api_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null default 'Default',
  key         text not null unique default ('sk_' || replace(gen_random_uuid()::text, '-', '')),
  last_used   timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists api_keys_user_idx on public.api_keys(user_id);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Create a profile + subscription row automatically for each new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','websites','campaigns','subscriptions'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s;', t);
    execute format('create trigger touch_%1$s before update on public.%1$s
                    for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- Owner-only access from the client. Server-side widget/event routes use
-- the SERVICE ROLE key, which bypasses RLS, so public endpoints stay safe.
-- =====================================================================
alter table public.profiles              enable row level security;
alter table public.websites              enable row level security;
alter table public.campaigns             enable row level security;
alter table public.events                enable row level security;
alter table public.analytics_impressions enable row level security;
alter table public.analytics_clicks      enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.usage_limits          enable row level security;
alter table public.integrations          enable row level security;
alter table public.api_keys              enable row level security;
alter table public.notification_templates enable row level security;

-- profiles
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- generic owner policy helper applied per-table below
do $$
declare t text;
begin
  foreach t in array array['websites','campaigns','subscriptions','usage_limits','integrations','api_keys'] loop
    execute format('drop policy if exists "owner all" on public.%1$s;', t);
    execute format($p$create policy "owner all" on public.%1$s
                     for all using (auth.uid() = user_id)
                     with check (auth.uid() = user_id);$p$, t);
  end loop;
end $$;

-- events / analytics: ownership is via the parent website
drop policy if exists "events via website" on public.events;
create policy "events via website" on public.events for all
  using (exists (select 1 from public.websites w where w.id = website_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.websites w where w.id = website_id and w.user_id = auth.uid()));

drop policy if exists "impressions via website" on public.analytics_impressions;
create policy "impressions via website" on public.analytics_impressions for select
  using (exists (select 1 from public.websites w where w.id = website_id and w.user_id = auth.uid()));

drop policy if exists "clicks via website" on public.analytics_clicks;
create policy "clicks via website" on public.analytics_clicks for select
  using (exists (select 1 from public.websites w where w.id = website_id and w.user_id = auth.uid()));

-- templates: readable by any authenticated user
drop policy if exists "templates read" on public.notification_templates;
create policy "templates read" on public.notification_templates for select using (true);
