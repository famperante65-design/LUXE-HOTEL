-- 01: TABLES (run first)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'client' check (role in ('client','staff','admin')),
  active boolean not null default true,      -- used for "deactivate user"
  created_at timestamptz default now()
);

create table services (
  id bigint generated always as identity primary key,
  service_name text not null,
  description text,
  room_type text,
  price numeric not null default 0,
  capacity integer not null default 1,
  availability text not null default 'Available',   -- Available / Unavailable
  image_url text,
  created_at timestamptz default now()
);

create table bookings (
  id bigint generated always as identity primary key,
  client_id uuid not null references profiles(id),
  service_id bigint not null references services(id),
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests > 0),
  contact_name text not null,
  contact_phone text not null,
  special_request text,
  total_amount numeric not null default 0,
  status text not null default 'Pending'
    check (status in ('Pending','Confirmed','Cancelled','Completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table schedules (
  id bigint generated always as identity primary key,
  service_id bigint not null references services(id) on delete cascade,
  available_date date not null,
  start_time time,
  end_time time,
  status text not null default 'Available',
  created_at timestamptz default now()
);

