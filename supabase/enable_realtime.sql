-- Run this in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/qtsjjwyjrczgvzosstpu/sql/new

-- Enable realtime on project_files so Yjs collaboration syncs between users
alter publication supabase_realtime add table project_files;
