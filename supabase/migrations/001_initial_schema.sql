-- ============================================================
-- Ultra Together — Database Schema
-- Run this once in Supabase SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type session_type as enum (
  'solo_walk', 'long_walk', 'family_walk', 'recovery', 'strength', 'rest'
);

create type gear_category as enum (
  'shoes', 'socks', 'pack', 'poles', 'other'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles: one row per user, auto-created on signup
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  email         text not null default '',
  display_name  text not null default '',
  couple_id     uuid,
  low_sleep_mode boolean not null default false
);

-- Couples: links two users as training partners
create table couples (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user1_id        uuid not null references profiles(id) on delete cascade,
  user2_id        uuid references profiles(id) on delete set null,
  invite_token    text unique,
  invite_email    text,
  active_event_id uuid
);

alter table profiles
  add constraint profiles_couple_id_fkey
  foreign key (couple_id) references couples(id) on delete set null;

-- Training events: shared goal
create table training_events (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  couple_id    uuid not null references couples(id) on delete cascade,
  name         text not null,
  event_date   date not null,
  distance_km  numeric(6,2) not null default 50,
  elevation_m  integer not null default 0,
  description  text,
  location     text,
  is_active    boolean not null default true
);

alter table couples
  add constraint couples_active_event_id_fkey
  foreign key (active_event_id) references training_events(id) on delete set null;

-- Training sessions
create table training_sessions (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  user_id           uuid not null references profiles(id) on delete cascade,
  couple_id         uuid not null references couples(id) on delete cascade,
  event_id          uuid references training_events(id) on delete set null,
  session_type      session_type not null default 'solo_walk',
  session_date      date not null,
  distance_km       numeric(6,2),
  duration_minutes  integer,
  elevation_m       integer,
  energy_level      smallint check (energy_level between 1 and 5),
  notes             text,
  blister_notes     text,
  fuelling_notes    text,
  completed         boolean not null default true
);

-- Gear items
create table gear_items (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  user_id       uuid not null references profiles(id) on delete cascade,
  couple_id     uuid not null references couples(id) on delete cascade,
  name          text not null,
  category      gear_category not null default 'other',
  brand         text,
  retire_at_km  numeric(7,2),
  current_km    numeric(7,2) not null default 0,
  notes         text,
  is_retired    boolean not null default false
);

-- Milestones: auto-awarded by trigger
create table milestones (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  user_id      uuid not null references profiles(id) on delete cascade,
  couple_id    uuid not null references couples(id) on delete cascade,
  distance_km  integer not null,
  achieved_at  timestamptz not null default now(),
  session_id   uuid references training_sessions(id) on delete set null,
  unique(user_id, distance_km)
);

-- Recovery logs
create table recovery_logs (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  user_id         uuid not null references profiles(id) on delete cascade,
  log_date        date not null,
  sleep_hours     numeric(3,1),
  soreness_level  smallint check (soreness_level between 1 and 5),
  notes           text,
  unique(user_id, log_date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles          enable row level security;
alter table couples           enable row level security;
alter table training_events   enable row level security;
alter table training_sessions enable row level security;
alter table gear_items        enable row level security;
alter table milestones        enable row level security;
alter table recovery_logs     enable row level security;

-- profiles: read own + partner; write own
create policy "profiles_select" on profiles for select using (
  id = auth.uid()
  or id in (
    select case
      when user1_id = auth.uid() then user2_id
      when user2_id = auth.uid() then user1_id
    end
    from couples
    where user1_id = auth.uid() or user2_id = auth.uid()
  )
);
create policy "profiles_insert" on profiles for insert with check (id = auth.uid());
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- couples: members can read/write their own couple
create policy "couples_select" on couples for select
  using (user1_id = auth.uid() or user2_id = auth.uid());
create policy "couples_insert" on couples for insert
  with check (user1_id = auth.uid());
create policy "couples_update" on couples for update
  using (user1_id = auth.uid() or user2_id = auth.uid());

-- Also allow anyone to read a couple by invite_token (for invite page)
create policy "couples_select_by_token" on couples for select
  using (invite_token is not null);

-- training_events: couple members full access
create policy "events_select" on training_events for select using (
  couple_id in (select id from couples where user1_id = auth.uid() or user2_id = auth.uid())
);
create policy "events_insert" on training_events for insert with check (
  couple_id in (select id from couples where user1_id = auth.uid() or user2_id = auth.uid())
);
create policy "events_update" on training_events for update using (
  couple_id in (select id from couples where user1_id = auth.uid() or user2_id = auth.uid())
);

-- training_sessions: couple members read; owner writes
create policy "sessions_select" on training_sessions for select using (
  couple_id in (select id from couples where user1_id = auth.uid() or user2_id = auth.uid())
);
create policy "sessions_insert" on training_sessions for insert with check (user_id = auth.uid());
create policy "sessions_update" on training_sessions for update using (user_id = auth.uid());
create policy "sessions_delete" on training_sessions for delete using (user_id = auth.uid());

-- gear_items: couple members read; owner writes
create policy "gear_select" on gear_items for select using (
  couple_id in (select id from couples where user1_id = auth.uid() or user2_id = auth.uid())
);
create policy "gear_insert" on gear_items for insert with check (user_id = auth.uid());
create policy "gear_update" on gear_items for update using (user_id = auth.uid());

-- milestones: couple members read; owner inserts
create policy "milestones_select" on milestones for select using (
  couple_id in (select id from couples where user1_id = auth.uid() or user2_id = auth.uid())
);
create policy "milestones_insert" on milestones for insert with check (user_id = auth.uid());

-- recovery_logs: own only
create policy "recovery_select" on recovery_logs for select using (user_id = auth.uid());
create policy "recovery_insert" on recovery_logs for insert with check (user_id = auth.uid());
create policy "recovery_update" on recovery_logs for update using (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at  before update on profiles          for each row execute function update_updated_at();
create trigger couples_updated_at   before update on couples           for each row execute function update_updated_at();
create trigger events_updated_at    before update on training_events   for each row execute function update_updated_at();
create trigger sessions_updated_at  before update on training_sessions for each row execute function update_updated_at();
create trigger gear_updated_at      before update on gear_items        for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-award milestones when cumulative km crosses 10/20/30/40/50
create or replace function check_milestones()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  total_km   numeric;
  threshold  integer;
begin
  if new.completed = true and new.distance_km is not null then
    select coalesce(sum(distance_km), 0)
      into total_km
      from training_sessions
     where user_id = new.user_id
       and completed = true
       and distance_km is not null;

    foreach threshold in array array[10, 20, 30, 40, 50] loop
      if total_km >= threshold then
        insert into milestones (user_id, couple_id, distance_km, session_id)
        values (new.user_id, new.couple_id, threshold, new.id)
        on conflict (user_id, distance_km) do nothing;
      end if;
    end loop;
  end if;
  return new;
end;
$$;

create trigger check_milestones_on_session
  after insert or update on training_sessions
  for each row execute function check_milestones();

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_sessions_user_date   on training_sessions(user_id, session_date desc);
create index idx_sessions_couple_date on training_sessions(couple_id, session_date desc);
create index idx_gear_user            on gear_items(user_id);
create index idx_milestones_user      on milestones(user_id);
create index idx_recovery_user_date   on recovery_logs(user_id, log_date desc);
