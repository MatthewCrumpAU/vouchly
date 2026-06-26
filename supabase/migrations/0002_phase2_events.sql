-- =====================================================================
-- VOUCH — Phase 2 migration
-- Adds an active/inactive flag to events (used by the Manual Activity
-- Manager) and a covering index for the widget's event lookup.
-- Idempotent: safe to run on an existing database.
-- =====================================================================

alter table public.events
  add column if not exists is_active boolean not null default true;

-- The widget fetches active events for a site, newest first.
create index if not exists events_active_lookup_idx
  on public.events (website_id, is_active, created_at desc);
