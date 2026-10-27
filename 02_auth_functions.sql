-- 02: AUTO-CREATE PROFILE ON SIGN UP + ROLE HELPER (run second)
-- 2. AUTO-CREATE PROFILE WHEN SOMEONE REGISTERS -------------------------
-- The user type chosen on the Register form (client / staff / admin) becomes the role.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, phone, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email,
          new.raw_user_meta_data->>'phone',
          case when new.raw_user_meta_data->>'role' in ('client','staff','admin')
               then new.raw_user_meta_data->>'role' else 'client' end);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: current user's role (security definer avoids RLS recursion)
create or replace function my_role() returns text
language sql security definer stable set search_path = public as
$$ select role from profiles where id = auth.uid() $$;

