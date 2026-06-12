-- Repair Supabase browser reads, Edge Function writes, and RLS state.

alter table public.profiles enable row level security;
alter table public.leaderboard_runs enable row level security;
alter table public.shared_runs enable row level security;
alter table public.rate_limits enable row level security;

grant usage on schema public to anon, authenticated, service_role;

revoke all on public.profiles from anon, authenticated;
revoke all on public.leaderboard_runs from anon, authenticated;
revoke all on public.shared_runs from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.leaderboard_runs to anon, authenticated;
grant select on public.shared_runs to anon, authenticated;

grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.leaderboard_runs to service_role;
grant select, insert, update, delete on public.shared_runs to service_role;
grant select, insert, update, delete on public.rate_limits to service_role;

drop policy if exists "profiles are readable" on public.profiles;
drop policy if exists "users update their profile" on public.profiles;
drop policy if exists "users insert their profile" on public.profiles;

drop policy if exists "leaderboard is public read" on public.leaderboard_runs;
drop policy if exists "leaderboard writes go through edge functions" on public.leaderboard_runs;
drop policy if exists "users do not update leaderboard runs" on public.leaderboard_runs;
drop policy if exists "users do not delete leaderboard runs" on public.leaderboard_runs;

drop policy if exists "shared runs are public read" on public.shared_runs;
drop policy if exists "shared run writes go through edge functions" on public.shared_runs;
drop policy if exists "shared runs are immutable" on public.shared_runs;
drop policy if exists "shared runs are not client deleted" on public.shared_runs;

drop policy if exists "rate limits service role access" on public.rate_limits;
drop policy if exists "rate limits are limited" on public.rate_limits;

create policy "profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "users insert their profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "users update their profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "leaderboard is public read"
on public.leaderboard_runs
for select
to anon, authenticated
using (true);

create policy "shared runs are public read"
on public.shared_runs
for select
to anon, authenticated
using (true);
