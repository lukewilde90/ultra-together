-- ============================================================
-- Ultra Together - Seed Data for Development
-- Run after schema migration
-- ============================================================

-- NOTE: This seed creates example data using hardcoded UUIDs.
-- Replace with actual auth user IDs from your Supabase project.

-- Seed users (these correspond to auth.users entries you create manually)
-- User A: alex@example.com
-- User B: sam@example.com

DO $$
DECLARE
  user_a_id UUID := 'a0000000-0000-0000-0000-000000000001';
  user_b_id UUID := 'b0000000-0000-0000-0000-000000000002';
  couple_id UUID := 'c0000000-0000-0000-0000-000000000003';
  event_id UUID := 'e0000000-0000-0000-0000-000000000004';
  shoe_a_id UUID := uuid_generate_v4();
  shoe_b_id UUID := uuid_generate_v4();
  pack_a_id UUID := uuid_generate_v4();
BEGIN

-- Profiles
INSERT INTO profiles (id, email, full_name, display_name, couple_id)
VALUES
  (user_a_id, 'alex@example.com', 'Alex Morgan', 'Alex', couple_id),
  (user_b_id, 'sam@example.com', 'Sam Morgan', 'Sam', couple_id)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  couple_id = EXCLUDED.couple_id;

-- Couple
INSERT INTO couples (id, name, user_a_id, user_b_id, active_event_id)
VALUES (couple_id, 'The Morgans', user_a_id, user_b_id, event_id)
ON CONFLICT (id) DO NOTHING;

-- Training Event (50km ultra, ~20 weeks away)
INSERT INTO training_events (id, couple_id, name, event_date, distance_km, elevation_m, location, description)
VALUES (
  event_id,
  couple_id,
  'North Downs Way 50',
  (CURRENT_DATE + INTERVAL '18 weeks')::DATE,
  50,
  1200,
  'Farnham, Surrey',
  'Our first 50km ultra hike together. We''ve got this!'
)
ON CONFLICT (id) DO NOTHING;

-- Gear
INSERT INTO gear_items (id, user_id, couple_id, name, category, brand, model, retire_at_km, current_km)
VALUES
  (shoe_a_id, user_a_id, couple_id, 'Trail Shoes (Alex)', 'shoes', 'Hoka', 'Speedgoat 5', 800, 234),
  (shoe_b_id, user_b_id, couple_id, 'Trail Shoes (Sam)', 'shoes', 'Salomon', 'Speedcross 6', 700, 156),
  (pack_a_id, user_a_id, couple_id, 'Running Pack', 'pack', 'Salomon', 'Advanced Skin 12', NULL, 0)
ON CONFLICT (id) DO NOTHING;

-- Training Sessions - last 6 weeks of history
INSERT INTO training_sessions (user_id, couple_id, event_id, session_type, session_date, distance_km, duration_minutes, elevation_m, energy_level, completed, notes, childcare_duty)
VALUES
  -- Week -6
  (user_a_id, couple_id, event_id, 'solo_walk', CURRENT_DATE - 43, 8.5, 95, 120, 3, TRUE, 'First proper trail run of the block. Legs felt heavy but pushed through.', 'partner'),
  (user_b_id, couple_id, event_id, 'solo_walk', CURRENT_DATE - 41, 6.0, 70, 80, 4, TRUE, 'Evening walk after kids bedtime. Lovely sunset!', 'user'),
  (user_a_id, couple_id, event_id, 'long_walk', CURRENT_DATE - 39, 14.2, 180, 280, 3, TRUE, 'Long walk along the coast. Beautiful but blisters on heel.', 'partner'),

  -- Week -5
  (user_b_id, couple_id, event_id, 'recovery', CURRENT_DATE - 35, 3.0, 45, 20, 5, TRUE, 'Easy recovery walk. Felt great.', 'user'),
  (user_a_id, couple_id, event_id, 'solo_walk', CURRENT_DATE - 33, 10.0, 110, 150, 4, TRUE, 'Good solid effort today. Pace improving.', 'shared'),
  (user_b_id, couple_id, event_id, 'long_walk', CURRENT_DATE - 32, 16.5, 210, 320, 3, TRUE, 'Longest walk yet! Bit tired at the end but manageable.', 'partner'),

  -- Week -4 (low sleep week for Sam)
  (user_a_id, couple_id, event_id, 'solo_walk', CURRENT_DATE - 28, 9.0, 100, 140, 4, TRUE, 'Steady session. Tested new socks - no blisters!', 'partner'),
  (user_b_id, couple_id, event_id, 'recovery', CURRENT_DATE - 26, 2.5, 35, 10, 2, TRUE, 'Kids were up all night. Just a gentle walk to stay moving.', 'user'),

  -- Week -3
  (user_a_id, couple_id, event_id, 'family_walk', CURRENT_DATE - 21, 5.5, 80, 60, 5, TRUE, 'Family walk with the kids. Slow but lovely!', 'shared'),
  (user_b_id, couple_id, event_id, 'solo_walk', CURRENT_DATE - 19, 11.0, 125, 200, 4, TRUE, 'Back on track this week. Felt strong.', 'partner'),
  (user_a_id, couple_id, event_id, 'long_walk', CURRENT_DATE - 17, 18.0, 225, 380, 3, TRUE, 'New longest walk! 18km done. Fuelling worked well with gels every 45 mins.', 'partner'),

  -- Week -2
  (user_b_id, couple_id, event_id, 'solo_walk', CURRENT_DATE - 14, 8.0, 90, 120, 4, TRUE, 'Good energy today. Trails were muddy but fun.', 'user'),
  (user_a_id, couple_id, event_id, 'recovery', CURRENT_DATE - 12, 4.0, 55, 30, 4, TRUE, 'Active recovery. Legs feel good.', 'shared'),
  (user_b_id, couple_id, event_id, 'long_walk', CURRENT_DATE - 11, 20.0, 260, 420, 3, TRUE, 'Hit 20km! Big milestone. Proud of this one.', 'partner'),

  -- This week
  (user_a_id, couple_id, event_id, 'solo_walk', CURRENT_DATE - 4, 10.5, 115, 180, 4, TRUE, 'Good tempo session. Heart rate felt controlled.', 'partner'),
  (user_b_id, couple_id, event_id, 'recovery', CURRENT_DATE - 2, 3.5, 50, 20, 5, TRUE, 'Easy one. Listened to podcast the whole way.', 'user');

-- Milestones (based on cumulative km above)
INSERT INTO milestones (user_id, couple_id, distance_km, achieved_at)
VALUES
  (user_a_id, couple_id, 10, NOW() - INTERVAL '35 days'),
  (user_a_id, couple_id, 20, NOW() - INTERVAL '17 days'),
  (user_b_id, couple_id, 10, NOW() - INTERVAL '32 days'),
  (user_b_id, couple_id, 20, NOW() - INTERVAL '11 days')
ON CONFLICT (user_id, distance_km) DO NOTHING;

-- Childcare plan for current week
INSERT INTO childcare_plans (couple_id, week_start, slots)
VALUES (
  couple_id,
  date_trunc('week', CURRENT_DATE)::DATE,
  '[
    {"date": "' || (date_trunc('week', CURRENT_DATE))::DATE || '", "duty": "shared", "notes": "School run together", "assigned_to": null},
    {"date": "' || (date_trunc('week', CURRENT_DATE) + INTERVAL ''1 day'')::DATE || '", "duty": "partner", "notes": "Alex trains morning", "assigned_to": "' || user_b_id || '"},
    {"date": "' || (date_trunc('week', CURRENT_DATE) + INTERVAL ''2 days'')::DATE || '", "duty": "user", "notes": "Sam trains evening", "assigned_to": "' || user_a_id || '"},
    {"date": "' || (date_trunc('week', CURRENT_DATE) + INTERVAL ''3 days'')::DATE || '", "duty": "shared", "notes": "Both free", "assigned_to": null},
    {"date": "' || (date_trunc('week', CURRENT_DATE) + INTERVAL ''4 days'')::DATE || '", "duty": "partner", "notes": "Alex long walk day", "assigned_to": "' || user_b_id || '"},
    {"date": "' || (date_trunc('week', CURRENT_DATE) + INTERVAL ''5 days'')::DATE || '", "duty": "user", "notes": "Sam long walk day", "assigned_to": "' || user_a_id || '"},
    {"date": "' || (date_trunc('week', CURRENT_DATE) + INTERVAL ''6 days'')::DATE || '", "duty": "shared", "notes": "Family walk day!", "assigned_to": null}
  ]'
)
ON CONFLICT (couple_id, week_start) DO NOTHING;

-- Recovery logs
INSERT INTO recovery_logs (user_id, log_date, sleep_hours, soreness_level, notes, low_sleep_flag)
VALUES
  (user_a_id, CURRENT_DATE - 7, 7.5, 2, 'Feeling good, minor quad soreness', FALSE),
  (user_a_id, CURRENT_DATE - 6, 6.0, 3, 'Bit tired after long walk', FALSE),
  (user_a_id, CURRENT_DATE - 5, 8.0, 2, 'Good recovery night', FALSE),
  (user_a_id, CURRENT_DATE - 1, 7.0, 1, 'Legs fresh!', FALSE),
  (user_b_id, CURRENT_DATE - 7, 5.0, 4, 'Kids up at 3am. Rough night.', TRUE),
  (user_b_id, CURRENT_DATE - 6, 5.5, 3, 'Another tough night', TRUE),
  (user_b_id, CURRENT_DATE - 5, 7.0, 2, 'Better sleep. Feeling more human.', FALSE),
  (user_b_id, CURRENT_DATE - 1, 7.5, 1, 'Good night! Ready to train.', FALSE);

END $$;
