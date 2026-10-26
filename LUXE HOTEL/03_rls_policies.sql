-- 03: ROW LEVEL SECURITY (run third)
-- 3. ROW LEVEL SECURITY ---------------------------------------------------
alter table profiles  enable row level security;
alter table services  enable row level security;
alter table bookings  enable row level security;
alter table schedules enable row level security;

-- PROFILES
create policy "own profile or staff/admin can read" on profiles for select
  using (id = auth.uid() or my_role() in ('staff','admin'));
create policy "update own profile (role locked)" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = my_role());
create policy "admin manages profiles" on profiles for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

-- SERVICES
create policy "logged-in users read services" on services for select
  using (auth.uid() is not null);
create policy "admin manages services" on services for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

-- SCHEDULES
create policy "logged-in users read schedules" on schedules for select
  using (auth.uid() is not null);
create policy "admin manages schedules" on schedules for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

-- BOOKINGS
create policy "client reads own bookings" on bookings for select
  using (client_id = auth.uid());
create policy "client creates own bookings" on bookings for insert
  with check (client_id = auth.uid() and status = 'Pending');
create policy "staff/admin read all bookings" on bookings for select
  using (my_role() in ('staff','admin'));
create policy "staff/admin update bookings" on bookings for update
  using (my_role() in ('staff','admin')) with check (my_role() in ('staff','admin'));
create policy "admin deletes bookings" on bookings for delete
  using (my_role() = 'admin');
