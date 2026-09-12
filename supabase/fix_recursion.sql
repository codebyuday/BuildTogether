-- Fix infinite recursion in team_members and related policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qtsjjwyjrczgvzosstpu/sql/new

-- Helper function: check if user is member of a project (security definer avoids recursion)
create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.team_members
    where project_id = pid and user_id = auth.uid()
  );
$$;

-- Drop ALL policies (old recursive + any partially-applied new ones)
drop policy if exists "Team members viewable by project members" on team_members;
drop policy if exists "Owners can manage members" on team_members;
drop policy if exists "Team members: owner or member can view" on team_members;
drop policy if exists "Team members: owner can manage" on team_members;
drop policy if exists "Task labels viewable by project members" on task_labels;
drop policy if exists "Members can manage task labels" on task_labels;
drop policy if exists "Task labels: members can view" on task_labels;
drop policy if exists "Task labels: members can manage" on task_labels;
drop policy if exists "Comments viewable by project members" on comments;
drop policy if exists "Comments: members can view" on comments;
drop policy if exists "Milestones viewable by project members" on milestones;
drop policy if exists "Milestones: members can view" on milestones;
drop policy if exists "Milestones: owner can manage" on milestones;
drop policy if exists "Repo connections viewable by project members" on repo_connections;
drop policy if exists "Owners can manage repo connections" on repo_connections;
drop policy if exists "Repo connections: members can view" on repo_connections;
drop policy if exists "Repo connections: owner can manage" on repo_connections;
drop policy if exists "Activity logs viewable by project members" on activity_logs;
drop policy if exists "Activity logs: members can view" on activity_logs;
drop policy if exists "Labels viewable by project members" on labels;
drop policy if exists "Owners can manage labels" on labels;
drop policy if exists "Labels: members can view" on labels;
drop policy if exists "Labels: owner can manage" on labels;
drop policy if exists "Members can view private projects" on projects;

-- Projects: allow viewing private projects if member
create policy "Members can view private projects" on projects for select using (
  is_project_member(id)
);

-- Team members: owner or member can view
create policy "Team members: owner or member can view" on team_members for select using (
  exists (select 1 from public.projects where id = team_members.project_id and owner_id = auth.uid())
  or team_members.user_id = auth.uid()
);

create policy "Team members: owner can manage" on team_members for all using (
  exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
);

-- Milestones
create policy "Milestones: members can view" on milestones for select using (
  exists (select 1 from public.projects where id = milestones.project_id and owner_id = auth.uid())
  or is_project_member(milestones.project_id)
);

create policy "Milestones: owner can manage" on milestones for all using (
  exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
);

-- Labels
create policy "Labels: members can view" on labels for select using (
  exists (select 1 from public.projects where id = labels.project_id and owner_id = auth.uid())
  or is_project_member(labels.project_id)
);

create policy "Labels: owner can manage" on labels for all using (
  exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
);

-- Task labels
create policy "Task labels: members can view" on task_labels for select using (
  exists (
    select 1 from public.tasks t
    where t.id = task_labels.task_id
      and (exists (select 1 from public.projects where id = t.project_id and owner_id = auth.uid())
           or is_project_member(t.project_id))
  )
);

create policy "Task labels: members can manage" on task_labels for all using (
  exists (
    select 1 from public.tasks t
    where t.id = task_labels.task_id
      and (exists (select 1 from public.projects where id = t.project_id and owner_id = auth.uid())
           or is_project_member(t.project_id))
  )
);

-- Comments
create policy "Comments: members can view" on comments for select using (
  exists (
    select 1 from public.tasks t
    where t.id = comments.task_id
      and (exists (select 1 from public.projects where id = t.project_id and owner_id = auth.uid())
           or is_project_member(t.project_id))
  )
);

-- Repo connections
create policy "Repo connections: members can view" on repo_connections for select using (
  exists (select 1 from public.projects where id = repo_connections.project_id and owner_id = auth.uid())
  or is_project_member(repo_connections.project_id)
);

create policy "Repo connections: owner can manage" on repo_connections for all using (
  exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
);

-- Activity logs
create policy "Activity logs: members can view" on activity_logs for select using (
  exists (select 1 from public.projects where id = activity_logs.project_id and owner_id = auth.uid())
  or is_project_member(activity_logs.project_id)
);
