-- 07: PAYMENT ACCOUNTS THE ADMIN CAN CHANGE (run after 06_payments.sql)
-- The "send payment to" account name and number for GCash, PayMaya and each bank.
-- Admin edits them on the "Payment Accounts" page. Clients only read the active ones.

create table if not exists payment_accounts (
  id bigint generated always as identity primary key,
  method text not null check (method in ('GCash','PayMaya','Bank Transfer')),
  bank text,                       -- bank name, only for Bank Transfer
  account_name text not null,
  account_number text not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table payment_accounts enable row level security;

drop policy if exists "logged-in users read payment accounts" on payment_accounts;
drop policy if exists "admin manages payment accounts" on payment_accounts;
create policy "logged-in users read payment accounts" on payment_accounts for select
  using (auth.uid() is not null);
create policy "admin manages payment accounts" on payment_accounts for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

-- Starter accounts (placeholders: change them on the admin page)
insert into payment_accounts (method, bank, account_name, account_number)
select * from (values
  ('GCash',         null,        'Your Hotel Name', '0917 000 0000'),
  ('PayMaya',       null,        'Your Hotel Name', '0918 000 0000'),
  ('Bank Transfer', 'BDO',       'Your Hotel Name', '0000 0000 0000'),
  ('Bank Transfer', 'BPI',       'Your Hotel Name', '0000 0000 00'),
  ('Bank Transfer', 'Metrobank', 'Your Hotel Name', '0000 0000 0000')
) as v(method, bank, account_name, account_number)
where not exists (select 1 from payment_accounts);
