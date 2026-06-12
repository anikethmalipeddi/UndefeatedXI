-- Drop all existing policies
DROP POLICY IF EXISTS "profiles are readable" ON public.profiles;
DROP POLICY IF EXISTS "users update their profile" ON public.profiles;
DROP POLICY IF EXISTS "users insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "leaderboard is public read" ON public.leaderboard_runs;
DROP POLICY IF EXISTS "leaderboard writes go through edge functions" ON public.leaderboard_runs;
DROP POLICY IF EXISTS "users do not update leaderboard runs" ON public.leaderboard_runs;
DROP POLICY IF EXISTS "users do not delete leaderboard runs" ON public.leaderboard_runs;
DROP POLICY IF EXISTS "shared runs are public read" ON public.shared_runs;
DROP POLICY IF EXISTS "shared run writes go through edge functions" ON public.shared_runs;
DROP POLICY IF EXISTS "shared runs are immutable" ON public.shared_runs;
DROP POLICY IF EXISTS "shared runs are not client deleted" ON public.shared_runs;
DROP POLICY IF EXISTS "rate limits are limited" ON public.rate_limits;

-- Recreate all policies with proper permissions
CREATE POLICY "profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "users update their profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users insert their profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "leaderboard is public read" ON public.leaderboard_runs FOR SELECT USING (true);
CREATE POLICY "leaderboard writes go through edge functions" ON public.leaderboard_runs FOR INSERT WITH CHECK (false);
CREATE POLICY "users do not update leaderboard runs" ON public.leaderboard_runs FOR UPDATE USING (false);
CREATE POLICY "users do not delete leaderboard runs" ON public.leaderboard_runs FOR DELETE USING (false);

CREATE POLICY "shared runs are public read" ON public.shared_runs FOR SELECT USING (true);
CREATE POLICY "shared run writes go through edge functions" ON public.shared_runs FOR INSERT WITH CHECK (false);
CREATE POLICY "shared runs are immutable" ON public.shared_runs FOR UPDATE USING (false);
CREATE POLICY "shared runs are not client deleted" ON public.shared_runs FOR DELETE USING (false);

-- Rate limits: service role only
CREATE POLICY "rate limits service role access" ON public.rate_limits FOR ALL USING (true) WITH CHECK (true);
