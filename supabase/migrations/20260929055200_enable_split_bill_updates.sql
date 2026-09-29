create policy "own split bills update" on public.split_bills for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant update on public.split_bills to authenticated;
