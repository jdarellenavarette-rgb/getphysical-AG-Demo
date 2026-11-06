-- Local development seed (applied by `supabase db reset`). Never run in prod.
-- Users are created through Supabase Auth sign-up; the on_auth_user_created
-- trigger creates their profile. Make yourself staff of a facility with:
--   insert into public.facility_staff (facility_id, user_id, role)
--   values ('fac_metro_core', '<your auth user id>', 'OWNER');

insert into public.facilities (
  id, name, registry_type, category, address, distance, lat, lng, coords,
  logo_url, cover_url, hours, amenities, is_open, inside_now_count, max_capacity,
  live_capacity, day_pass_price_php, monthly_sub_price_php, court_hourly_price_php,
  rating, review_count, has_active_challenge, challenge_title
) values
(
  'fac_metro_core', 'Metro Core Arena', 'COMMERCIAL', 'Commercial Gym & Performance Center',
  '7th Ave, Bonifacio Global City, Taguig', '0.8 km', 14.549, 121.05,
  '{"lat": 14.549, "lng": 121.05}',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  '06:00 AM - 11:00 PM', array['Olympic Racks', 'Sauna', 'Cold Plunge', 'Recovery Bar'],
  true, 0, 100, '{"current": 0, "max": 100}', 250, 1500, null, 4.9, 148, true,
  'Heaviest Deadlift in BGC'
),
(
  'fac_nexus_club', 'Nexus Racket & Court Club', 'COMMUNITY', 'Racket Sports & Multi-Court Facility',
  'Chino Roces Ave, Makati City', '2.1 km', 14.554, 121.018,
  '{"lat": 14.554, "lng": 121.018}',
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
  '07:00 AM - 10:00 PM', array['Pickleball Courts', 'Hardwood Basketball', 'Showers', 'Pro Shop'],
  true, 0, 50, '{"current": 0, "max": 50}', null, null, 200, 4.8, 92, false, null
)
on conflict (id) do nothing;

insert into public.pr_challenges (id, facility_id, title, category, benchmark, expires_in_days)
values ('chall_deadlift_bgc', 'fac_metro_core', 'Heaviest Deadlift in BGC', 'LIFT', '1RM Deadlift (kg)', 14)
on conflict (id) do nothing;
