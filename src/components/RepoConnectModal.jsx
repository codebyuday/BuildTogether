import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { parseRepoUrl } from '../lib/github'

export default function RepoConnectModal({ projectId, currentRepoUrl, onClose }) {
  const queryClient = useQueryClient()
  const [url, setUrl] = useState(currentRepoUrl || '')
  const [error, setError] = useState('')

  const connect = useMutation({
    mutationFn: async () => {
      const parsed = parseRepoUrl(url)
      if (!parsed) throw new Error('Invalid GitHub URL')
      setError('')

      const { error: upsertError } = await supabase.from('repo_connections').upsert({
        project_id: projectId, owner: parsed.owner, repo_name: parsed.repo, sync_enabled: true,
      }, { onConflict: 'project_id' })
      if (upsertError) throw upsertError

      await supabase.from('projects').update({ repo_url: url }).eq('id', projectId)
    },
    onSuccess: () => { toast.success('Repo connected!'); queryClient.invalidateQueries({ queryKey: ['project', projectId] }); onClose() },
    onError: (err) => { setError(err.message); toast.error(err.message) },
  })

  const disconnect = useMutation({
    mutationFn: async () => {
      await supabase.from('repo_connections').delete().eq('project_id', projectId)
      await supabase.from('projects').update({ repo_url: null }).eq('id', projectId)
    },
    onSuccess: () => { toast.success('Repo disconnected'); queryClient.invalidateQueries({ queryKey: ['project', projectId] }); onClose() },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/40 rounded-xl shadow-2xl p-space-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-[16px] font-semibold text-ink mb-4">Connect GitHub Repository</h3>
        <div>
          <label className="text-[11px] font-mono text-secondary uppercase">Repository URL</label>
          <input value={url} onChange={e => { setUrl(e.target.value); setError('') }}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-ink font-mono placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1"
            placeholder="https://github.com/owner/repo" />
          {error && <p className="text-[12px] text-error mt-1">{error}</p>}
          <p className="text-[11px] text-secondary mt-1">Public repos only. Stats will be fetched automatically.</p>
        </div>
        <div className="flex justify-between mt-6">
          {currentRepoUrl && (
            <button onClick={() => disconnect.mutate()} disabled={disconnect.isPending}
              className="text-[13px] text-error hover:underline disabled:opacity-50">Disconnect</button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-secondary hover:text-ink rounded-lg">Cancel</button>
            <button onClick={() => url.trim() && connect.mutate()} disabled={!url.trim() || connect.isPending}
              className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
              {connect.isPending ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
