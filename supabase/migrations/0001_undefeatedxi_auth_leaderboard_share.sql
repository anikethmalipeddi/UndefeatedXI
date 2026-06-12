create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_runs (
  run_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  mode_id text not null check (mode_id ~ '^[a-z0-9_]+$'),
  mode_name text not null check (char_length(mode_name) between 2 and 64),
  formation_id text not null check (formation_id ~ '^\d-\d-\d(-\d)?$'),
  score integer not null check (score between -5000 and 20000),
  grade text not null check (grade in ('SS', 'S', 'A+', 'A', 'B', 'C', 'D')),
  record jsonb not null check (
    jsonb_typeof(record) = 'object'
    and (record ? 'wins')
    and (record ? 'draws')
    and (record ? 'losses')
    and ((record->>'wins')::integer + (record->>'draws')::integer + (record->>'losses')::integer between 1 and 42)
  ),
  goals_for integer not null check (goals_for between 0 and 250),
  goals_against integer not null check (goals_against between 0 and 250),
  team_rating numeric not null check (team_rating between 0 and 100),
  picks_digest text not null check (char_length(picks_digest) <= 2000),
  share_text text not null check (char_length(share_text) <= 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.shared_runs (
  share_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and octet_length(snapshot::text) <= 60000
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.leaderboard_runs enable row level security;
alter table public.shared_runs enable row level security;
alter table public.rate_limits enable row level security;

create policy "profiles are readable" on public.profiles for select using (true);
create policy "users update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "users insert their profile" on public.profiles for insert with check (auth.uid() = id);

create policy "leaderboard is public read" on public.leaderboard_runs for select using (true);
create policy "leaderboard writes go through edge functions" on public.leaderboard_runs for insert with check (true);
create policy "users do not update leaderboard runs" on public.leaderboard_runs for update using (false);
create policy "users do not delete leaderboard runs" on public.leaderboard_runs for delete using (false);

create policy "shared runs are public read" on public.shared_runs for select using (true);
create policy "shared run writes go through edge functions" on public.shared_runs for insert with check (true);
create policy "shared runs are immutable" on public.shared_runs for update using (false);
create policy "shared runs are not client deleted" on public.shared_runs for delete using (false);

create index if not exists leaderboard_runs_score_idx on public.leaderboard_runs (score desc, created_at desc);
create index if not exists leaderboard_runs_mode_idx on public.leaderboard_runs (mode_id, score desc, created_at desc);
create index if not exists leaderboard_runs_user_idx on public.leaderboard_runs (user_id, created_at desc);
create index if not exists shared_runs_created_idx on public.shared_runs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_name text;
  safe_name text;
begin
  raw_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Player');
  safe_name := left(regexp_replace(raw_name, '[^[:alnum:] ._-]', '', 'g'), 32);
  if char_length(trim(safe_name)) < 2 then
    safe_name := 'Player';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, safe_name)
  on conflict (id) do update set display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
