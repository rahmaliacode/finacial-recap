create table public.transactions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 kind text not null check (kind in ('expense','income')),
 amount bigint not null check (amount > 0),
 category text not null check (char_length(category) between 1 and 60),
 description text not null check (char_length(description) between 1 and 240),
 occurred_on date not null default current_date,
 created_at timestamptz not null default now()
);
create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
alter table public.transactions enable row level security;
create policy "own transactions select" on public.transactions for select to authenticated using ((select auth.uid()) = user_id);
create policy "own transactions insert" on public.transactions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own transactions update" on public.transactions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own transactions delete" on public.transactions for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.transactions to authenticated;
