-- =====================================================================
-- VOUCH — Seed data
-- Run AFTER schema.sql. Creates system notification templates and (optionally)
-- demo content for an existing user.
--
-- To seed demo websites/campaigns/events for yourself:
--   1. Sign up in the app first (creates your auth user + profile).
--   2. Replace :demo_user below with your user id from auth.users.
-- =====================================================================

-- System notification templates (safe to run anytime)
insert into public.notification_templates (type, name, description, default_content) values
  ('recent_purchase', 'Recent Purchase', 'Someone just bought a product',
     '{"headline":"New purchase!","message":"{name} from {city} just purchased {product}","cta":{"text":"","url":""}}'),
  ('recent_signup', 'Recent Signup', 'Someone just signed up',
     '{"headline":"New signup","message":"{name} from {city} just signed up","cta":{"text":"","url":""}}'),
  ('recent_download', 'Recent Download', 'Someone downloaded something',
     '{"headline":"New download","message":"{name} just downloaded {product}","cta":{"text":"","url":""}}'),
  ('live_visitors', 'Live Visitors', 'Live viewer count',
     '{"headline":"","message":"{count} people are viewing this page right now","cta":{"text":"","url":""}}'),
  ('announcement', 'Announcement', 'A custom announcement',
     '{"headline":"Announcement","message":"{message}","cta":{"text":"Learn more","url":""}}'),
  ('low_stock', 'Low Stock', 'Scarcity / urgency',
     '{"headline":"Almost gone","message":"Only {count} spots left","cta":{"text":"","url":""}}'),
  ('countdown', 'Countdown Timer', 'Time-based urgency',
     '{"headline":"Offer ends soon","message":"{time} remaining","cta":{"text":"Claim now","url":""}}'),
  ('review', 'Review / Rating', 'Social proof from a review',
     '{"headline":"5-star review","message":"{name} gave us a {count}-star review","rating":5}'),
  ('page_visits', 'Page Visits', 'How many viewed a page',
     '{"headline":"","message":"{count} people viewed this page today","cta":{"text":"","url":""}}'),
  ('custom', 'Custom Message', 'Fully custom popup',
     '{"headline":"{headline}","message":"{message}","cta":{"text":"","url":""}}')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- OPTIONAL demo content. Uncomment and set your user id to use.
-- ---------------------------------------------------------------------
-- do $$
-- declare
--   demo_user uuid := 'PASTE-YOUR-AUTH-USER-ID';
--   w uuid;
--   c uuid;
-- begin
--   insert into public.websites (user_id, name, domain)
--   values (demo_user, 'My Store', 'mystore.com')
--   returning id into w;
--
--   insert into public.campaigns (user_id, website_id, name, notification_type, position)
--   values (demo_user, w, 'Recent Sales', 'recent_purchase', 'bottom-left')
--   returning id into c;
--
--   insert into public.events (website_id, campaign_id, event_type, name, city, country, product, is_manual)
--   values
--     (w, c, 'recent_purchase', 'Sarah', 'Sydney', 'Australia', 'Content Creator Elite', true),
--     (w, c, 'recent_purchase', 'James', 'London', 'UK', 'Pro Plan', true),
--     (w, c, 'recent_purchase', 'Mia',   'Austin', 'USA', 'Starter Plan', true);
-- end $$;
