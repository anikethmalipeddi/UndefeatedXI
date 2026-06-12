-- Grant service_role permissions on tables used by Edge Functions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_runs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leaderboard_runs TO service_role;
GRANT SELECT, UPDATE ON public.rate_limits TO service_role;
GRANT SELECT ON public.profiles TO service_role;
