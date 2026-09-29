alter table public.split_bills add constraint split_bills_id_user_unique unique(id,user_id);
alter table public.transactions drop constraint transactions_split_bill_fkey;
alter table public.transactions add constraint transactions_split_bill_owner_fkey foreign key (split_bill_id,user_id) references public.split_bills(id,user_id) on delete set null (split_bill_id);
