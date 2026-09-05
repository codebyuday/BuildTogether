import { supabase } from './supabase'

export async function logActivity({ projectId, userId, action, entityType, entityId, metadata = {} }) {
  const { error } = await supabase.from('activity_logs').insert({
    project_id: projectId,
    actor_id: userId,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    metadata,
  })
  if (error) console.error('Activity log error:', error)
}

export const ACTIVITY_ICONS = {
  'project.created': 'folder',
  'project.updated': 'edit',
  'project.deleted': 'delete',
  'application.submitted': 'send',
  'application.accepted': 'check_circle',
  'application.rejected': 'cancel',
  'member.added': 'person_add',
  'member.removed': 'person_remove',
  'task.created': 'add_task',
  'task.updated': 'edit',
  'task.status_changed': 'swap_horiz',
  'task.deleted': 'delete',
  'milestone.created': 'flag',
  'milestone.updated': 'edit',
  'milestone.completed': 'check_circle',
  'comment.created': 'comment',
  'star.added': 'star',
  'star.removed': 'star_border',
}

export const ACTIVITY_LABELS = {
  'project.created': 'created project',
  'project.updated': 'updated project',
  'project.deleted': 'deleted project',
  'application.submitted': 'applied to project',
  'application.accepted': 'accepted application',
  'application.rejected': 'rejected application',
  'member.added': 'joined the team',
  'member.removed': 'was removed from the team',
  'task.created': 'created task',
  'task.updated': 'updated task',
  'task.status_changed': 'moved task',
  'task.deleted': 'deleted task',
  'milestone.created': 'created milestone',
  'milestone.updated': 'updated milestone',
  'milestone.completed': 'completed milestone',
  'comment.created': 'commented on task',
  'star.added': 'starred project',
  'star.removed': 'unstarred project',
}
