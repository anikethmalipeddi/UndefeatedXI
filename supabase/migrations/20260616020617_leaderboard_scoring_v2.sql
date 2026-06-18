alter table public.leaderboard_runs
  add column if not exists result_tier text,
  add column if not exists scoring_version integer not null default 1;

alter table public.leaderboard_runs
  drop constraint if exists leaderboard_runs_score_check;

alter table public.leaderboard_runs
  add constraint leaderboard_runs_score_check
  check (score between -5000 and 50000);

alter table public.leaderboard_runs
  drop constraint if exists leaderboard_runs_scoring_version_check;

alter table public.leaderboard_runs
  add constraint leaderboard_runs_scoring_version_check
  check (scoring_version between 1 and 10);

create index if not exists leaderboard_runs_scoring_v2_idx
  on public.leaderboard_runs (scoring_version desc, score desc, created_at desc);

create index if not exists leaderboard_runs_user_mode_best_idx
  on public.leaderboard_runs (user_id, mode_id, score desc, created_at desc);
