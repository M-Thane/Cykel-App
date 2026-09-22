-- Cykel-App backend schema.
-- Run this once in the Supabase project's SQL editor (Project -> SQL Editor -> New query).
--
-- Auth model: we do NOT use Supabase Auth. "Log ind med Strava" is handled entirely
-- by the Cloudflare Worker, which is the only thing that ever talks to this database
-- (using the service_role key, which bypasses RLS). RLS is enabled with no policies
-- as defense-in-depth, so the public anon key -- if it ever leaked -- grants access to
-- nothing.

create extension if not exists "pgcrypto";

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  strava_athlete_id bigint unique not null,
  strava_access_token text not null,
  strava_refresh_token text not null,
  strava_expires_at timestamptz not null,
  -- cursor for the periodic fallback poll (see worker's scheduled handler);
  -- also updated whenever a webhook event is processed for this user.
  strava_last_synced_at timestamptz not null default now(),
  -- which bike a newly-synced Strava activity is logged against, since Strava
  -- has no concept of "which of your bikes" the way this app models it.
  default_bike_id uuid,
  first_name text,
  last_name text,
  created_at timestamptz not null default now()
);

create table if not exists bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  name text not null,
  discipline text not null,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists components (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  bike_id uuid not null references bikes(id) on delete cascade,
  type text not null,
  custom_label text,
  installed_at_km numeric not null,
  installed_at_date date not null,
  lifespan_km numeric not null,
  active boolean not null default true,
  replaced_at_km numeric,
  replaced_at_date date,
  notes text
);

create table if not exists rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  bike_id uuid not null references bikes(id) on delete cascade,
  date date not null,
  km numeric not null,
  note text,
  duration_min numeric,
  -- set when the ride was created from a Strava activity via the webhook,
  -- used to avoid importing the same activity twice.
  strava_activity_id bigint unique
);

create table if not exists training_profiles (
  user_id uuid primary key references app_users(id) on delete cascade,
  ftp_watts numeric,
  max_hr numeric,
  weekly_goal_km numeric,
  weekly_goal_days numeric,
  goal text
);

alter table app_users add constraint app_users_default_bike_fk
  foreign key (default_bike_id) references bikes(id) on delete set null;

create index if not exists bikes_user_id_idx on bikes(user_id);
create index if not exists components_user_id_idx on components(user_id);
create index if not exists components_bike_id_idx on components(bike_id);
create index if not exists rides_user_id_idx on rides(user_id);
create index if not exists rides_bike_id_idx on rides(bike_id);

alter table app_users enable row level security;
alter table bikes enable row level security;
alter table components enable row level security;
alter table rides enable row level security;
alter table training_profiles enable row level security;
-- No policies are created: with RLS on and zero policies, every table is
-- inaccessible except via the service_role key (used only by the Worker).
