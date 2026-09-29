create table public.savings_goals (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 80),
 target_amount bigint not null check (target_amount > 0),
 created_at timestamptz not null default now(),
 unique (id, user_id)
);
create index savings_goals_user_idx on public.savings_goals(user_id, created_at desc);
alter table public.savings_goals enable row level security;
create policy "own goals select" on public.savings_goals for select to authenticated using ((select auth.uid()) = user_id);
create policy "own goals insert" on public.savings_goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own goals update" on public.savings_goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own goals delete" on public.savings_goals for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.savings_goals to authenticated;

create table public.savings_entries (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 goal_id uuid not null,
 kind text not null check (kind in ('deposit','withdraw')),
 amount bigint not null check (amount > 0),
 note text not null default '' check (char_length(note) <= 160),
 created_at timestamptz not null default now(),
 foreign key (goal_id, user_id) references public.savings_goals(id, user_id) on delete cascade
);
create index savings_entries_goal_idx on public.savings_entries(user_id, goal_id, created_at desc);
alter table public.savings_entries enable row level security;
create policy "own savings entries select" on public.savings_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "own savings entries insert" on public.savings_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own savings entries delete" on public.savings_entries for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, delete on public.savings_entries to authenticated;

create table public.split_bills (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 100),
 total_amount bigint not null check (total_amount > 0),
 participants jsonb not null check (jsonb_typeof(participants) = 'array' and jsonb_array_length(participants) between 2 and 30),
 created_at timestamptz not null default now()
);
create index split_bills_user_idx on public.split_bills(user_id, created_at desc);
alter table public.split_bills enable row level security;
create policy "own split bills select" on public.split_bills for select to authenticated using ((select auth.uid()) = user_id);
create policy "own split bills insert" on public.split_bills for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own split bills delete" on public.split_bills for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, delete on public.split_bills to authenticated;
