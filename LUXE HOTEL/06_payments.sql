-- 06: PAYMENT BEFORE BOOKING (run after 01-03)
-- A client must pay first (GCash, PayMaya or Bank Transfer). The booking is only saved together with
-- its payment details. Staff then checks the reference number and marks the payment "Verified".

alter table bookings add column if not exists payment_method    text;           -- GCash / PayMaya / Bank Transfer
alter table bookings add column if not exists payment_bank      text;           -- bank name (Bank Transfer only)
alter table bookings add column if not exists payer_name        text;           -- name on the sender account
alter table bookings add column if not exists payer_account     text;           -- sender mobile / account number
alter table bookings add column if not exists payment_reference text;           -- reference no. from the receipt
alter table bookings add column if not exists amount_paid       numeric default 0;
alter table bookings add column if not exists payment_status    text default 'Unpaid';
alter table bookings add column if not exists paid_at           timestamptz;

alter table bookings drop constraint if exists bookings_payment_method_check;
alter table bookings add constraint bookings_payment_method_check
  check (payment_method is null or payment_method in ('GCash','PayMaya','Bank Transfer'));

alter table bookings drop constraint if exists bookings_payment_status_check;
alter table bookings add constraint bookings_payment_status_check
  check (payment_status in ('Unpaid','For Verification','Verified','Rejected'));

-- Clients can now only create a booking when the payment is filled in.
drop policy if exists "client creates own bookings" on bookings;
create policy "client creates own bookings" on bookings for insert
  with check (
    client_id = auth.uid()
    and status = 'Pending'
    and payment_method is not null
    and coalesce(length(trim(payment_reference)), 0) > 0
    and payment_status = 'For Verification'
  );
