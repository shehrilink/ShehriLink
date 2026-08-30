-- Security fix: the citizen-facing app never edits a complaint after
-- submission, and status changes must only come from the staff dashboard
-- (service-role key). The original migration's UPDATE policy let a citizen
-- change ANY column on their own row via the anon key — including status.
-- Run this once if you already applied migration-002-mobile.sql.

drop policy if exists "own complaints update" on complaints;
