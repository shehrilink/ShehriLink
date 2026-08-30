-- ShehriLink migration: WhatsApp bot -> Flutter mobile app
-- Run this in the Supabase SQL Editor.
--
-- Confirmed with the project owner: existing `complaints` rows are test data
-- tied to phone numbers with no citizen accounts behind them, so this drops
-- and recreates `complaints` / `status_history` rather than migrating rows.
-- `admin_users` and `settings` (staff login + dashboard settings) are
-- untouched by this migration.

-- 1. Drop WhatsApp-era tables
drop table if exists status_history cascade;
drop table if exists complaints cascade;
drop table if exists sessions cascade;

-- 2. New citizen-facing schema
create table app_users (
  id uuid default gen_random_uuid() primary key,
  cnic text unique not null,
  full_name text not null,
  created_at timestamptz default now()
);

create table complaints (
  id uuid default gen_random_uuid() primary key,
  ref_number text unique not null,
  user_id uuid references app_users(id) not null,
  category text not null, -- 'street_light' | 'road_damage' | 'water_supply' | 'sewage' | 'garbage'
  area text not null,
  description text,
  photo_url text,
  status text default 'pending', -- 'pending' | 'in_progress' | 'resolved'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table status_history (
  id uuid default gen_random_uuid() primary key,
  complaint_id uuid references complaints(id),
  old_status text,
  new_status text,
  changed_at timestamptz default now()
);

create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references app_users(id),
  complaint_id uuid references complaints(id),
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 3. Row Level Security
-- Note: app_users.id MUST equal the Supabase Auth user's id (auth.uid()) for
-- these policies to work — the Flutter app inserts app_users with
-- `id: supabase.auth.currentUser!.id` right after signUp, not a fresh uuid.

alter table app_users enable row level security;
alter table complaints enable row level security;
alter table status_history enable row level security;
alter table notifications enable row level security;

create policy "own app_user read" on app_users
  for select to authenticated using (id = auth.uid());
create policy "own app_user insert" on app_users
  for insert to authenticated with check (id = auth.uid());

create policy "own complaints read" on complaints
  for select to authenticated using (user_id = auth.uid());
create policy "own complaints insert" on complaints
  for insert to authenticated with check (user_id = auth.uid());
-- Deliberately no UPDATE policy for citizens: the mobile app never edits a
-- complaint after submission, and status changes must only ever come from
-- the staff dashboard (service-role key, bypasses RLS). Without this, a
-- citizen could otherwise set their own complaint's status to "resolved"
-- directly via the anon key.

create policy "own status_history read" on status_history
  for select to authenticated using (
    complaint_id in (select id from complaints where user_id = auth.uid())
  );

create policy "own notifications read" on notifications
  for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- The web admin dashboard connects with the service-role key, which bypasses
-- RLS entirely, so staff can read/write across all users' rows without any
-- policy here. No insert policy is needed for status_history/notifications
-- from the citizen app — only the dashboard writes those.

-- 4. Storage bucket for complaint photos
insert into storage.buckets (id, name, public)
values ('complaint-photos', 'complaint-photos', true)
on conflict (id) do nothing;

-- Photos are uploaded to `{auth.uid()}/{filename}` by the Flutter app.
create policy "citizens upload own complaint photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'complaint-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "public read complaint photos" on storage.objects
  for select using (bucket_id = 'complaint-photos');
