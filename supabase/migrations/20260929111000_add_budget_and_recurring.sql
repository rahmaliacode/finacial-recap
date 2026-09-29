create table public.budget_limits (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 month date not null check (extract(day from month) = 1),
 category text not null check (char_length(category) between 1 and 60),
 amount bigint not null check (amount > 0),
 created_at timestamptz not null default now(),
 unique (user_id, month, category)
);
create index budget_limits_user_month_idx on public.budget_limits(user_id, month);
alter table public.budget_limits enable row level security;
create policy "own budgets select" on public.budget_limits for select to authenticated using ((select auth.uid()) = user_id);
create policy "own budgets insert" on public.budget_limits for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own budgets update" on public.budget_limits for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own budgets delete" on public.budget_limits for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.budget_limits to authenticated;

create table public.recurring_items (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 100),
 kind text not null check (kind in ('expense','income')),
 amount bigint not null check (amount > 0),
 category text not null check (char_length(category) between 1 and 60),
 day_of_month integer not null check (day_of_month between 1 and 31),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique(id,user_id)
);
create index recurring_items_user_idx on public.recurring_items(user_id, active);
alter table public.recurring_items enable row level security;
create policy "own recurring select" on public.recurring_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "own recurring insert" on public.recurring_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own recurring update" on public.recurring_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own recurring delete" on public.recurring_items for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.recurring_items to authenticated;

alter table public.transactions add constraint transactions_id_user_unique unique(id,user_id);
alter table public.transactions add column recurring_item_id uuid,
 add column recurring_month date,
 add column split_bill_id uuid,
 add column split_person_index integer,
 add constraint transactions_recurring_owner_fkey foreign key (recurring_item_id,user_id) references public.recurring_items(id,user_id) on delete set null (recurring_item_id),
 add constraint transactions_split_bill_fkey foreign key (split_bill_id) references public.split_bills(id) on delete set null (split_bill_id),
 add constraint recurring_pair_check check ((recurring_item_id is null) = (recurring_month is null)),
 add constraint split_pair_check check ((split_bill_id is null) = (split_person_index is null));
create unique index transactions_recurring_once_idx on public.transactions(user_id,recurring_item_id,recurring_month) where recurring_item_id is not null;
create unique index transactions_split_once_idx on public.transactions(user_id,split_bill_id,split_person_index) where split_bill_id is not null;

alter table public.savings_entries add column transaction_id uuid unique,
 add constraint savings_entries_transaction_owner_fkey foreign key (transaction_id,user_id) references public.transactions(id,user_id) on delete set null (transaction_id);
