-- Enables Supabase Realtime on the notifications table. Tables are NOT
-- automatically added to the realtime publication when created via SQL —
-- this is almost certainly why the mobile app's Realtime subscription never
-- fired and new notifications only appeared after a manual pull-to-refresh.

alter publication supabase_realtime add table notifications;
