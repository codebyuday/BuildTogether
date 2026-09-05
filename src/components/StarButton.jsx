import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function StarButton({ projectId, size = 'md' }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: starData } = useQuery({
    queryKey: ['star', projectId, user?.id],
    queryFn: async () => {
      if (!user) return { starred: false, count: 0 }
      const { data: userStar } = await supabase.from('stars').select('id').eq('project_id', projectId).eq('user_id', user.id).maybeSingle()
      const { count } = await supabase.from('stars').select('id', { count: 'exact', head: true }).eq('project_id', projectId)
      return { starred: !!userStar, count: count || 0 }
    },
    enabled: !!projectId,
  })

  const toggleStar = useMutation({
    mutationFn: async () => {
      if (starData?.starred) {
        await supabase.from('stars').delete().eq('project_id', projectId).eq('user_id', user.id)
      } else {
        await supabase.from('stars').insert({ project_id: projectId, user_id: user.id })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['star', projectId] })
      queryClient.invalidateQueries({ queryKey: ['explore-projects'] })
      queryClient.invalidateQueries({ queryKey: ['my-projects'] })
    },
  })

  if (!user) return null

  const sizeClasses = size === 'sm' ? 'text-[12px] px-2 py-0.5' : 'text-[13px] px-2.5 py-1'

  return (
    <button
      onClick={() => toggleStar.mutate()}
      disabled={toggleStar.isPending}
      className={`flex items-center gap-1 rounded-lg border transition-all active:scale-[0.98] ${
        starData?.starred
          ? 'bg-tertiary/10 border-tertiary/30 text-tertiary'
          : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:text-tertiary hover:border-tertiary/30'
      } ${sizeClasses}`}
    >
      <span className={`material-symbols-outlined ${size === 'sm' ? 'text-[14px]' : 'text-[16px]'}`}
        style={starData?.starred ? { fontVariationSettings: "'FILL' 1" } : {}}>
        star
      </span>
      {starData?.count > 0 && <span className="font-mono">{starData.count}</span>}
    </button>
  )
}
