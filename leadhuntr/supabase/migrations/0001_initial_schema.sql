-- ============================================================
-- LeadHuntr - Initial Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  notification_frequency text not null default 'daily' check (notification_frequency in ('realtime', 'daily', 'weekly', 'off')),
  leads_found_today integer not null default 0,
  leads_found_total integer not null default 0,
  leads_reset_at date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_stripe_customer_idx on public.profiles(stripe_customer_id);

-- ============================================================
-- monitors
-- ============================================================
create table if not exists public.monitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  subreddits text[] not null,
  keywords text[] not null,
  negative_keywords text[] not null default '{}',
  is_active boolean not null default true,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists monitors_user_id_idx on public.monitors(user_id);
create index if not exists monitors_active_idx on public.monitors(is_active) where is_active = true;

-- ============================================================
-- leads
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reddit_post_id text not null unique,
  subreddit text not null,
  title text not null,
  body text,
  author text not null,
  permalink text not null,
  score integer not null default 0,
  num_comments integer not null default 0,
  intent_score integer not null check (intent_score between 0 and 100),
  intent_category text not null check (intent_category in (
    'buying_intent',
    'pain_point',
    'recommendation_request',
    'comparison',
    'negative_review'
  )),
  ai_summary text,
  suggested_reply text,
  status text not null default 'new' check (status in ('new', 'saved', 'contacted', 'dismissed')),
  reddit_created_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads(user_id);
create index if not exists leads_monitor_id_idx on public.leads(monitor_id);
create index if not exists leads_intent_score_idx on public.leads(intent_score desc);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(status);

-- ============================================================
-- scan_logs
-- ============================================================
create table if not exists public.scan_logs (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors(id) on delete cascade,
  posts_scanned integer not null default 0,
  leads_found integer not null default 0,
  error text,
  scanned_at timestamptz not null default now()
);

create index if not exists scan_logs_monitor_id_idx on public.scan_logs(monitor_id);
create index if not exists scan_logs_scanned_at_idx on public.scan_logs(scanned_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.monitors enable row level security;
alter table public.leads enable row level security;
alter table public.scan_logs enable row level security;

-- Profiles: users see/update only themselves
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Monitors: users see only their own
drop policy if exists "monitors_select_own" on public.monitors;
create policy "monitors_select_own"
  on public.monitors for select
  using (auth.uid() = user_id);

drop policy if exists "monitors_insert_own" on public.monitors;
create policy "monitors_insert_own"
  on public.monitors for insert
  with check (auth.uid() = user_id);

drop policy if exists "monitors_update_own" on public.monitors;
create policy "monitors_update_own"
  on public.monitors for update
  using (auth.uid() = user_id);

drop policy if exists "monitors_delete_own" on public.monitors;
create policy "monitors_delete_own"
  on public.monitors for delete
  using (auth.uid() = user_id);

-- Leads: users see only their own
drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
  on public.leads for select
  using (auth.uid() = user_id);

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own"
  on public.leads for update
  using (auth.uid() = user_id);

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own"
  on public.leads for delete
  using (auth.uid() = user_id);

-- Scan logs: users see logs for their monitors
drop policy if exists "scan_logs_select_own" on public.scan_logs;
create policy "scan_logs_select_own"
  on public.scan_logs for select
  using (
    exists (
      select 1 from public.monitors m
      where m.id = scan_logs.monitor_id and m.user_id = auth.uid()
    )
  );

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reset daily lead counter helper (called from cron or app)
create or replace function public.reset_daily_lead_counters()
returns void as $$
begin
  update public.profiles
  set leads_found_today = 0,
      leads_reset_at = (now() at time zone 'utc')::date
  where leads_reset_at < (now() at time zone 'utc')::date;
end;
$$ language plpgsql security definer;
