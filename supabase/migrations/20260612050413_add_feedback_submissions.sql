create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('bug', 'player_data', 'feature', 'general')),
  message text not null check (char_length(message) between 8 and 2000),
  contact_email text check (contact_email is null or contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  mode_id text,
  run_id text,
  page_url text,
  user_agent text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.feedback_submissions enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant insert on public.feedback_submissions to anon, authenticated;
grant select, insert, update, delete on public.feedback_submissions to service_role;

create index if not exists feedback_submissions_created_at_idx
on public.feedback_submissions (created_at desc);

create index if not exists feedback_submissions_category_idx
on public.feedback_submissions (category, created_at desc);

drop policy if exists "anyone can submit feedback" on public.feedback_submissions;
drop policy if exists "feedback is private to admins" on public.feedback_submissions;

create policy "anyone can submit feedback"
on public.feedback_submissions
for insert
to anon, authenticated
with check (
  char_length(message) between 8 and 2000
  and category in ('bug', 'player_data', 'feature', 'general')
  and (
    contact_email is null
    or contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
  and (
    user_id is null
    or user_id = (select auth.uid())
  )
);

create policy "feedback is private to admins"
on public.feedback_submissions
for select
to anon, authenticated
using (false);
