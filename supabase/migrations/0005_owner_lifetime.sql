-- =====================================================================
-- VOUCH — add the "lifetime" (owner) plan value to the plan_tier enum.
--
-- IMPORTANT: Postgres can't add an enum value and then use it in the same
-- transaction. Run THIS statement on its own first (it auto-commits in the
-- Supabase SQL editor), THEN run supabase/make_me_owner.sql separately.
-- =====================================================================

alter type plan_tier add value if not exists 'lifetime';
