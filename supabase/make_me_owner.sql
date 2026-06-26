-- =====================================================================
-- VOUCH — grant YOUR account unlimited lifetime access + admin + white-label.
-- Run AFTER 0005_owner_lifetime.sql has been applied.
-- Replace the email with the one you signed up with.
-- =====================================================================

update public.profiles
set plan        = 'lifetime',   -- unlimited websites/campaigns/impressions, all features
    is_admin    = true,         -- unlocks the Admin panel
    white_label = true          -- enables white-label branding (set your brand in Settings)
where email = 'YOU@EXAMPLE.COM';

-- Keep the subscriptions row consistent (optional, avoids webhook overwrites).
update public.subscriptions
set plan = 'lifetime', status = 'active'
where user_id = (select id from public.profiles where email = 'YOU@EXAMPLE.COM');
