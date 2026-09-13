import { useState, useCallback, lazy, Suspense, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { parseRepoUrl, pushToGitHub } from '../lib/github'
import toast from 'react-hot-toast'
import { CardSkeleton } from '../components/Skeleton'

const CollaborativeCodeEditor = lazy(() => import('../components/CollaborativeCodeEditor'))

const LANG_MAP = {
  js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
  py: 'python', html: 'html', css: 'css', json: 'json',
  md: 'javascript', txt: 'javascript',
}

function getLanguage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return LANG_MAP[ext] || 'javascript'
}

export default function CodeEditor() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState(null)
  const [newFileName, setNewFileName] = useState('')
  const [commitMsg, setCommitMsg] = useState('')
  const [showNewFile, setShowNewFile] = useState(false)
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('gh_token') || '')
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const pendingSaveRef = useRef(null)

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      return data
    },
  })

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['project-files', id],
    queryFn: async () => {
      const { data } = await supabase.from('project_files')
        .select('*').eq('project_id', id).order('filename')
      return data || []
    },
  })

  const createFileMutation = useMutation({
    mutationFn: async ({ filename, language }) => {
      const { data, error } = await supabase.from('project_files').insert({
        project_id: id, filename, content: '', language,
      }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', id] })
      setSelectedFile(file)
      setNewFileName('')
      setShowNewFile(false)
      toast.success('File created')
    },
    onError: (e) => toast.error(e.message),
  })

  const saveMutation = useMutation({
    mutationFn: async ({ fileId, content }) => {
      const { error } = await supabase.from('project_files')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', fileId)
      if (error) throw error
    },
    onSuccess: () => toast.success('Saved'),
    onError: (e) => toast.error(`Save failed: ${e.message}`),
  })

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId) => {
      const { error } = await supabase.from('project_files').delete().eq('id', fileId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', id] })
      if (deleteFileMutation.variables === selectedFile?.id) {
        setSelectedFile(null)
      }
      toast.success('File deleted')
    },
    onError: (e) => toast.error(e.message),
  })

  const pushMutation = useMutation({
    mutationFn: async () => {
      if (!project?.repo_url) throw new Error('No GitHub repo connected')
      if (!ghToken) throw new Error('NO_TOKEN')
      const repo = parseRepoUrl(project.repo_url)
      if (!repo) throw new Error('Invalid repo URL')

      const results = []
      for (const file of files) {
        const result = await pushToGitHub(repo.owner, repo.repo, file.filename, file.content, commitMsg || `Update ${file.filename}`)
        results.push(result)
      }
      return results
    },
    onSuccess: () => {
      toast.success('Pushed to GitHub')
      setCommitMsg('')
    },
    onError: (e) => {
      if (e.message === 'NO_TOKEN') {
        setShowTokenModal(true)
      } else {
        toast.error(`Push failed: ${e.message}`)
      }
    },
  })

  const saveToken = () => {
    if (!tokenInput.trim()) return
    localStorage.setItem('gh_token', tokenInput.trim())
    setGhToken(tokenInput.trim())
    setShowTokenModal(false)
    setTokenInput('')
    toast.success('GitHub token saved')
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) return
    createFileMutation.mutate({ filename: newFileName.trim(), language: getLanguage(newFileName.trim()) })
  }

  const handleContentChange = useCallback((content) => {
    if (selectedFile) {
      if (pendingSaveRef.current) clearTimeout(pendingSaveRef.current)
      pendingSaveRef.current = setTimeout(() => {
        saveMutation.mutate({ fileId: selectedFile.id, content })
      }, 1500)
    }
  }, [selectedFile?.id])

  const handleSelectFile = (file) => {
    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current)
      pendingSaveRef.current = null
    }
    setSelectedFile(file)
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${id}`} className="text-muted hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-[18px] font-bold text-on-surface">Code Editor</h1>
          {project?.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
              className="text-[12px] text-primary hover:underline font-mono">
              {parseRepoUrl(project.repo_url)?.owner}/{parseRepoUrl(project.repo_url)?.repo}
            </a>
          )}
        </div>
        {project?.repo_url && files.length > 0 && (
          <div className="flex items-center gap-2">
            {!ghToken && (
              <button onClick={() => setShowTokenModal(true)}
                className="flex items-center gap-1 rounded-lg border border-tertiary/30 bg-tertiary/10 text-tertiary px-2.5 py-1.5 text-[11px] font-semibold hover:bg-tertiary/20 transition-colors">
                <span className="material-symbols-outlined text-[12px]">key</span>
                Set GitHub Token
              </button>
            )}
            <input value={commitMsg} onChange={e => setCommitMsg(e.target.value)}
              placeholder="Commit message..."
              className="w-48 rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] text-on-surface placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            <button onClick={() => pushMutation.mutate()} disabled={pushMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-on-surface text-white px-3 py-1.5 text-[12px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-[14px]">upload</span>
              {pushMutation.isPending ? 'Pushing...' : 'Push to GitHub'}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 min-h-[600px]">
        <div className="w-56 shrink-0 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Files</span>
            <button onClick={() => setShowNewFile(!showNewFile)}
              className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
          </div>

          {showNewFile && (
            <div className="flex gap-1">
              <input value={newFileName} onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateFile()}
                placeholder="filename.js"
                autoFocus
                className="flex-1 rounded-md border border-line bg-white px-2 py-1 text-[12px] text-on-surface placeholder:text-muted focus:border-primary outline-none" />
              <button onClick={handleCreateFile} className="text-[12px] text-primary font-semibold hover:underline">Add</button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-1">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : files.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line p-4 text-center">
              <span className="material-symbols-outlined text-[24px] text-muted/30 mb-1 block">note_add</span>
              <p className="text-[11px] text-muted">No files yet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {files.map(file => (
                <div key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className={`flex items-center justify-between group rounded-lg px-2.5 py-1.5 text-[12px] cursor-pointer transition-colors ${
                    selectedFile?.id === file.id ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[14px]">draft</span>
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteFileMutation.mutate(file.id) }}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all">
                    <span className="material-symbols-outlined text-[12px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 rounded-xl border border-line bg-white overflow-hidden" style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
          {selectedFile ? (
            <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
              <CollaborativeCodeEditor
                roomId={`${id}-${selectedFile.id}`}
                fileId={selectedFile.id}
                language={selectedFile.language}
                initialContent={selectedFile.content || ''}
                onChange={handleContentChange}
              />
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[48px] text-muted/20 mb-3">code</span>
              <p className="text-[14px] text-muted mb-1">Select a file to start editing</p>
              <p className="text-[12px] text-muted/60">or create a new one from the sidebar</p>
            </div>
          )}
        </div>
      </div>

      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-6 shadow-2xl">
            <h3 className="mb-2 text-[16px] font-semibold text-on-surface">Connect GitHub</h3>
            <p className="text-[13px] text-on-surface-variant mb-4">
              Enter a GitHub Personal Access Token with <code className="bg-surface-container px-1 py-0.5 rounded text-[12px]">repo</code> scope to push code.
            </p>
            <input value={tokenInput} onChange={e => setTokenInput(e.target.value)}
              type="password" placeholder="ghp_xxxxxxxxxxxx"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-on-surface placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none mb-4"
              onKeyDown={e => e.key === 'Enter' && saveToken()} autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowTokenModal(false); setTokenInput('') }}
                className="rounded-lg px-3 py-1.5 text-[13px] text-on-surface-variant hover:text-on-surface">Cancel</button>
              <button onClick={saveToken} disabled={!tokenInput.trim()}
                className="rounded-lg bg-primary text-white px-4 py-1.5 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                Save Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
