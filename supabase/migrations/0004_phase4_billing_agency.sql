-- =====================================================================
-- VOUCH — Phase 4 migration: billing + agency/white-label. Idempotent.
-- =====================================================================

-- Stripe customer + white-label fields on the profile.
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists brand_name  text;
alter table public.profiles add column if not exists brand_color text default '#4f46e5';
alter table public.profiles add column if not exists white_label boolean not null default false;

-- Agency client sub-accounts (workspaces grouping websites).
create table if not exists public.clients (
  id              uuid primary key default gen_random_uuid(),
  agency_user_id  uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists clients_agency_idx on public.clients(agency_user_id);

alter table public.websites add column if not exists client_id uuid references public.clients(id) on delete set null;

alter table public.clients enable row level security;
drop policy if exists "owner all" on public.clients;
create policy "owner all" on public.clients for all
  using (auth.uid() = agency_user_id) with check (auth.uid() = agency_user_id);
