-- Explore and public project pages show member counts/rosters; without this,
-- non-members always saw "0 members" on every public project.
create policy "Public projects: anyone can view team members"
on public.team_members for select
using (
  exists (
    select 1 from public.projects p
    where p.id = team_members.project_id and p.visibility = 'public'
  )
);
