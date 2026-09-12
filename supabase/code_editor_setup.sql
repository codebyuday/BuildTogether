-- ============================================
-- BuildTogether — Code Editor (project_files)
-- ============================================

create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  filename text not null,
  content text default '',
  language text default 'javascript',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, filename)
);

alter table project_files enable row level security;

create policy "Members can view project files"
  on project_files for select
  using (
    project_id in (
      select project_id from team_members where user_id = auth.uid()
      union
      select id from projects where owner_id = auth.uid()
    )
  );

create policy "Members can insert project files"
  on project_files for insert
  with check (
    project_id in (
      select project_id from team_members where user_id = auth.uid()
      union
      select id from projects where owner_id = auth.uid()
    )
  );

create policy "Members can update project files"
  on project_files for update
  using (
    project_id in (
      select project_id from team_members where user_id = auth.uid()
      union
      select id from projects where owner_id = auth.uid()
    )
  );

create policy "Members can delete project files"
  on project_files for delete
  using (
    project_id in (
      select project_id from team_members where user_id = auth.uid()
      union
      select id from projects where owner_id = auth.uid()
    )
  );

create index idx_project_files_project on project_files(project_id);
