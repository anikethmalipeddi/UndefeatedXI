-- Disable RLS temporarily to test if that's the issue
ALTER TABLE public.shared_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_runs DISABLE ROW LEVEL SECURITY;
