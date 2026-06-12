revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create policy "rate limits service role only"
on public.rate_limits
for all
to service_role
using (true)
with check (true);

create index if not exists shared_runs_user_id_idx on public.shared_runs (user_id);
