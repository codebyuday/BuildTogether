-- ============================================
-- BuildTogether — Full Schema for New Project
-- Run this in Supabase SQL Editor on qtsjjwyjrczgvzosstpu
-- ============================================

-- Enable extensions
create extension if not exists "uuid-ossp" with schema extensions;

-- ── Profiles ──
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text default ''::text,
  bio text default ''::text,
  avatar_url text default ''::text,
  skills text[] default '{}',
  github_username text,
  email text default ''::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- ── Projects ──
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  tech_stack text[] default '{}',
  status text not null default 'recruiting' check (status in ('recruiting', 'full', 'archived')),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  repo_url text,
  github_repo_id bigint,
  spec text,
  created_at timestamptz default now()
);

alter table projects enable row level security;
create policy "Public projects viewable by everyone" on projects for select using (visibility = 'public' or owner_id = auth.uid());
create policy "Members can view private projects" on projects for select using (
  exists (select 1 from team_members where project_id = id and user_id = auth.uid())
);
create policy "Users can create projects" on projects for insert with check (auth.uid() = owner_id);
create policy "Owners can update projects" on projects for update using (auth.uid() = owner_id);
create policy "Owners can delete projects" on projects for delete using (auth.uid() = owner_id);

-- ── Team Members ──
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

alter table team_members enable row level security;
create policy "Team members viewable by project members" on team_members for select using (
  exists (select 1 from team_members tm where tm.project_id = team_members.project_id and tm.user_id = auth.uid())
  or exists (select 1 from projects where id = team_members.project_id and owner_id = auth.uid())
);
create policy "Owners can manage members" on team_members for all using (
  exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);
create policy "Users can join via accepted application" on team_members for insert with check (auth.uid() = user_id);

-- ── Applications ──
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

alter table applications enable row level security;
create policy "Project owners can view applications" on applications for select using (
  exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);
create policy "Users can view own applications" on applications for select using (auth.uid() = user_id);
create policy "Users can apply" on applications for insert with check (auth.uid() = user_id);
create policy "Owners can review applications" on applications for update using (
  exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);

-- ── Milestones ──
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  phase text,
  start_date date,
  end_date date,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  "order" int default 0,
  created_at timestamptz default now()
);

alter table milestones enable row level security;
create policy "Milestones viewable by project members" on milestones for select using (
  exists (select 1 from team_members where project_id = milestones.project_id and user_id = auth.uid())
  or exists (select 1 from projects where id = milestones.project_id and owner_id = auth.uid())
);
create policy "Owners can manage milestones" on milestones for all using (
  exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);

-- ── Tasks ──
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  title text not null,
  description text,
  assignee_id uuid references profiles(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  created_by uuid references profiles(id),
  position int default 0,
  created_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "Tasks viewable by project members" on tasks for select using (
  exists (select 1 from team_members where project_id = tasks.project_id and user_id = auth.uid())
  or exists (select 1 from projects where id = tasks.project_id and owner_id = auth.uid())
);
create policy "Members can create tasks" on tasks for insert with check (
  exists (select 1 from team_members where project_id = tasks.project_id and user_id = auth.uid())
  or exists (select 1 from projects where id = tasks.project_id and owner_id = auth.uid())
);
create policy "Members can update tasks" on tasks for update using (
  exists (select 1 from team_members where project_id = tasks.project_id and user_id = auth.uid())
  or exists (select 1 from projects where id = tasks.project_id and owner_id = auth.uid())
);
create policy "Owners can delete tasks" on tasks for delete using (
  exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);

-- ── Notifications ──
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean default false,
  entity_id uuid,
  project_id uuid references projects(id) on delete cascade,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "System can insert notifications" on notifications for insert with check (true);

-- ── Repo Connections ──
create table if not exists repo_connections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  owner text not null,
  repo_name text not null,
  access_token_ref text,
  sync_enabled boolean default true,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

alter table repo_connections enable row level security;
create policy "Repo connections viewable by project members" on repo_connections for select using (
  exists (select 1 from team_members where project_id = repo_connections.project_id and user_id = auth.uid())
  or exists (select 1 from projects where id = repo_connections.project_id and owner_id = auth.uid())
);
create policy "Owners can manage repo connections" on repo_connections for all using (
  exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);

-- ── Activity Logs ──
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  project_id uuid not null references projects(id) on delete cascade,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  entity_type text,
  entity_id uuid
);

alter table activity_logs enable row level security;
create policy "Activity logs viewable by project members" on activity_logs for select using (
  exists (select 1 from team_members where project_id = activity_logs.project_id and user_id = auth.uid())
  or exists (select 1 from projects where id = activity_logs.project_id and owner_id = auth.uid())
);
create policy "System can insert activity logs" on activity_logs for insert with check (true);

-- ── Labels ──
create table if not exists labels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

alter table labels enable row level security;
create policy "Labels viewable by project members" on labels for select using (
  exists (select 1 from team_members where project_id = labels.project_id and user_id = auth.uid())
  or exists (select 1 from projects where id = labels.project_id and owner_id = auth.uid())
);
create policy "Owners can manage labels" on labels for all using (
  exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);

-- ── Task Labels ──
create table if not exists task_labels (
  task_id uuid not null references tasks(id) on delete cascade,
  label_id uuid not null references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

alter table task_labels enable row level security;
create policy "Task labels viewable by project members" on task_labels for select using (
  exists (select 1 from tasks t join team_members tm on tm.project_id = t.project_id where t.id = task_labels.task_id and tm.user_id = auth.uid())
  or exists (select 1 from tasks t join projects p on p.id = t.project_id where t.id = task_labels.task_id and p.owner_id = auth.uid())
);
create policy "Members can manage task labels" on task_labels for all using (
  exists (select 1 from tasks t join team_members tm on tm.project_id = t.project_id where t.id = task_labels.task_id and tm.user_id = auth.uid())
  or exists (select 1 from tasks t join projects p on p.id = t.project_id where t.id = task_labels.task_id and p.owner_id = auth.uid())
);

-- ── Comments ──
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table comments enable row level security;
create policy "Comments viewable by project members" on comments for select using (
  exists (select 1 from tasks t join team_members tm on tm.project_id = t.project_id where t.id = comments.task_id and tm.user_id = auth.uid())
  or exists (select 1 from tasks t join projects p on p.id = t.project_id where t.id = comments.task_id and p.owner_id = auth.uid())
);
create policy "Members can create comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on comments for delete using (auth.uid() = user_id);

-- ── Stars ──
create table if not exists stars (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

alter table stars enable row level security;
create policy "Stars viewable by everyone" on stars for select using (true);
create policy "Users can star projects" on stars for insert with check (auth.uid() = user_id);
create policy "Users can unstar projects" on stars for delete using (auth.uid() = user_id);

-- ── Indexes ──
create index if not exists idx_projects_owner on projects(owner_id);
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_projects_visibility on projects(visibility);
create index if not exists idx_team_members_project on team_members(project_id);
create index if not exists idx_team_members_user on team_members(user_id);
create index if not exists idx_applications_project on applications(project_id);
create index if not exists idx_applications_user on applications(user_id);
create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_tasks_assignee on tasks(assignee_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_read on notifications(read);
create index if not exists idx_activity_logs_project on activity_logs(project_id);
create index if not exists idx_labels_project on labels(project_id);
create index if not exists idx_comments_task on comments(task_id);
create index if not exists idx_stars_project on stars(project_id);
create index if not exists idx_stars_user on stars(user_id);

-- ── Realtime ──
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table applications;
alter publication supabase_realtime add table comments;

-- ── Auto-create profile on signup ──
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
