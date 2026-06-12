-- Fix RLS policies to allow Edge Function writes

drop policy if exists "leaderboard writes go through edge functions" on public.leaderboard_runs;
drop policy if exists "shared run writes go through edge functions" on public.shared_runs;

create policy "leaderboard writes go through edge functions" on public.leaderboard_runs for insert with check (true);
create policy "shared run writes go through edge functions" on public.shared_runs for insert with check (true);
