create table public.money_accounts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 80),
 opening_balance bigint not null default 0 check (opening_balance >= 0),
 created_at timestamptz not null default now(),
 unique (id,user_id),
 unique (user_id,name)
);
create index money_accounts_user_idx on public.money_accounts(user_id);
alter table public.money_accounts enable row level security;
create policy "own accounts select" on public.money_accounts for select to authenticated using ((select auth.uid())=user_id);
create policy "own accounts insert" on public.money_accounts for insert to authenticated with check ((select auth.uid())=user_id);
create policy "own accounts update" on public.money_accounts for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "own accounts delete" on public.money_accounts for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,update,delete on public.money_accounts to authenticated;

alter table public.transactions add column account_id uuid;
alter table public.transactions add constraint transactions_account_owner_fkey
 foreign key (account_id,user_id) references public.money_accounts(id,user_id) on delete restrict;
create index transactions_account_idx on public.transactions(user_id,account_id);

create table public.account_transfers (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 from_account_id uuid not null,
 to_account_id uuid not null,
 amount bigint not null check (amount>0),
 occurred_on date not null default current_date,
 note text not null default '' check (char_length(note)<=160),
 created_at timestamptz not null default now(),
 check (from_account_id<>to_account_id),
 foreign key (from_account_id,user_id) references public.money_accounts(id,user_id) on delete restrict,
 foreign key (to_account_id,user_id) references public.money_accounts(id,user_id) on delete restrict
);
create index account_transfers_user_date_idx on public.account_transfers(user_id,occurred_on desc);
alter table public.account_transfers enable row level security;
create policy "own transfers select" on public.account_transfers for select to authenticated using ((select auth.uid())=user_id);
create policy "own transfers insert" on public.account_transfers for insert to authenticated with check ((select auth.uid())=user_id);
create policy "own transfers update" on public.account_transfers for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "own transfers delete" on public.account_transfers for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,update,delete on public.account_transfers to authenticated;
