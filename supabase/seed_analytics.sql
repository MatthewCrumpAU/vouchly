-- =====================================================================
-- VOUCH — Optional demo analytics
-- Generates ~30 days of impressions/clicks so the Analytics dashboard and
-- chart have something to show. Set your user id, then run.
-- =====================================================================
do $$
declare
  demo_user uuid := 'PASTE-YOUR-AUTH-USER-ID';
  c record;
  d int;
  base int;
  imps int;
  clks int;
  urls text[] := array['/', '/pricing', '/checkout', '/blog', '/product/elite'];
begin
  for c in select id, website_id from public.campaigns where user_id = demo_user loop
    for d in 0..29 loop
      base := 40 + floor(random() * 160)::int;            -- daily impressions
      imps := base;
      clks := floor(imps * (0.03 + random() * 0.07))::int; -- 3–10% CTR
      insert into public.analytics_impressions (website_id, campaign_id, url, created_at)
      select c.website_id, c.id, urls[1 + floor(random() * array_length(urls,1))::int],
             (now() - (d || ' days')::interval) - (random() * interval '12 hours')
      from generate_series(1, imps);
      insert into public.analytics_clicks (website_id, campaign_id, url, created_at)
      select c.website_id, c.id, urls[1 + floor(random() * array_length(urls,1))::int],
             (now() - (d || ' days')::interval) - (random() * interval '12 hours')
      from generate_series(1, clks);
    end loop;
  end loop;
end $$;
