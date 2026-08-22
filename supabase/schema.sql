-- ShehriLink schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).

create table if not exists sessions (
  phone text primary key,
  current_step text default 'start',
  category text,
  area text,
  description text,
  photo_url text,
  updated_at timestamptz default now()
);

create table if not exists complaints (
  id uuid default gen_random_uuid() primary key,
  ref_number text unique not null,
  phone text not null,
  category text not null, -- 'street_light' | 'road_damage' | 'water_supply' | 'sewage' | 'garbage'
  area text not null,
  description text,
  photo_url text,
  status text default 'pending', -- 'pending' | 'in_progress' | 'resolved'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists status_history (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references complaints(id),
  old_status text,
  new_status text,
  changed_at timestamptz default now()
);

create table if not exists admin_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  full_name text,
  role text default 'staff' -- 'staff' | 'supervisor'
);

create table if not exists settings (
  key text primary key,
  value text
);

-- Row Level Security: the n8n bot should connect with the service-role key,
-- which bypasses RLS entirely. These policies only govern the admin dashboard,
-- which authenticates staff via Supabase Auth (email/password).

alter table sessions enable row level security;
alter table complaints enable row level security;
alter table status_history enable row level security;
alter table admin_users enable row level security;
alter table settings enable row level security;

create policy "authenticated read sessions" on sessions
  for select to authenticated using (true);

create policy "authenticated read complaints" on complaints
  for select to authenticated using (true);
create policy "authenticated update complaints" on complaints
  for update to authenticated using (true) with check (true);

create policy "authenticated read status_history" on status_history
  for select to authenticated using (true);
create policy "authenticated insert status_history" on status_history
  for insert to authenticated with check (true);

create policy "authenticated read admin_users" on admin_users
  for select to authenticated using (true);
create policy "bootstrap first admin_users insert" on admin_users
  for insert to authenticated
  with check (not exists (select 1 from admin_users));

create policy "authenticated read settings" on settings
  for select to authenticated using (true);
create policy "authenticated upsert settings" on settings
  for insert to authenticated with check (true);
create policy "authenticated update settings" on settings
  for update to authenticated using (true) with check (true);
