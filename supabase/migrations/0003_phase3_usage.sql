-- =====================================================================
-- VOUCH — Phase 3 migration
-- Atomic monthly impression counter for plan-limit enforcement.
-- Idempotent.
-- =====================================================================

-- Increment the current-month impression count for the owner of a website.
-- Called by the public impression endpoint (service role). SECURITY DEFINER
-- so it can write the usage row regardless of the caller.
create or replace function public.bump_impression(p_website uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid;
  v_period date := date_trunc('month', now())::date;
begin
  select user_id into v_user from public.websites where id = p_website;
  if v_user is null then return; end if;

  insert into public.usage_limits (user_id, period_start, impressions_used)
  values (v_user, v_period, 1)
  on conflict (user_id, period_start)
  do update set impressions_used = public.usage_limits.impressions_used + 1;
end;
$$;

-- Read current-month impressions for a user (used by the config gate + settings).
create or replace function public.current_month_impressions(p_user uuid)
returns int
language sql stable
as $$
  select coalesce(impressions_used, 0)
  from public.usage_limits
  where user_id = p_user and period_start = date_trunc('month', now())::date;
$$;
