-- Adds back the `settings` table (used for the daily complaint limit the
-- mobile app enforces) with corrected RLS: any authenticated user (citizens
-- included) can read settings, but only municipal staff (their auth email
-- matches a row in admin_users) can write them. The original schema.sql
-- allowed ANY authenticated user to write settings, which would have let a
-- citizen overwrite their own daily limit via the anon key.

create table if not exists settings (
  key text primary key,
  value text
);

alter table settings enable row level security;

drop policy if exists "authenticated read settings" on settings;
drop policy if exists "authenticated upsert settings" on settings;
drop policy if exists "authenticated update settings" on settings;

create policy "anyone authenticated read settings" on settings
  for select to authenticated using (true);

create policy "staff insert settings" on settings
  for insert to authenticated
  with check (exists (select 1 from admin_users where email = auth.jwt() ->> 'email'));

create policy "staff update settings" on settings
  for update to authenticated
  using (exists (select 1 from admin_users where email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admin_users where email = auth.jwt() ->> 'email'));
