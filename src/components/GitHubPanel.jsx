import { useQuery } from '@tanstack/react-query'
import { parseRepoUrl, fetchRepoStats, fetchCommitActivity, fetchLanguages } from '../lib/github'

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  Go: '#00ADD8', Rust: '#dea584', 'C++': '#f34b7d', C: '#555555', Ruby: '#701516',
  PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', Svelte: '#ff3e00',
}

export default function GitHubPanel({ repoUrl }) {
  const parsed = parseRepoUrl(repoUrl)

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['github-stats', parsed?.owner, parsed?.repo],
    queryFn: () => fetchRepoStats(parsed.owner, parsed.repo),
    enabled: !!parsed,
    staleTime: 5 * 60 * 1000,
  })

  const { data: commits = [] } = useQuery({
    queryKey: ['github-commits', parsed?.owner, parsed?.repo],
    queryFn: () => fetchCommitActivity(parsed.owner, parsed.repo),
    enabled: !!parsed,
    staleTime: 5 * 60 * 1000,
  })

  const { data: languages = {} } = useQuery({
    queryKey: ['github-languages', parsed?.owner, parsed?.repo],
    queryFn: () => fetchLanguages(parsed.owner, parsed.repo),
    enabled: !!parsed,
    staleTime: 5 * 60 * 1000,
  })

  if (!parsed) return null
  if (loadingStats) return <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  if (!stats) return <div className="text-[13px] text-on-surface-variant py-4">Could not load GitHub data.</div>

  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0)
  const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCommits = Math.max(...commits.map(c => c.total), 1)

  return (
    <div className="space-y-space-lg">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container border border-outline-variant/40 rounded-lg p-3">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase">Stars</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[20px] font-bold text-tertiary">{stats.stars.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/40 rounded-lg p-3">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase">Forks</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[20px] font-bold text-primary">{stats.forks}</span>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/40 rounded-lg p-3">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase">Open Issues</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[20px] font-bold text-on-surface">{stats.openIssues}</span>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/40 rounded-lg p-3">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase">Language</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANG_COLORS[stats.language] || '#666' }} />
            <span className="text-[14px] font-medium text-on-surface">{stats.language || 'N/A'}</span>
          </div>
        </div>
      </div>

      {commits.length > 0 && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md">
          <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">Commit Activity (12 weeks)</span>
          <div className="flex items-end gap-1 mt-3 h-20">
            {commits.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/60 rounded-t" style={{ height: `${(c.total / maxCommits) * 100}%`, minHeight: c.total > 0 ? '4px' : '1px' }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] font-mono text-on-surface-variant">
            <span>12 weeks ago</span>
            <span>Today</span>
          </div>
        </div>
      )}

      {langEntries.length > 0 && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md">
          <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">Languages</span>
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-surface-container-highest mt-3">
            {langEntries.map(([lang, bytes]) => (
              <div key={lang} className="h-full" style={{ width: `${(bytes / totalBytes) * 100}%`, backgroundColor: LANG_COLORS[lang] || '#666' }} title={`${lang} ${Math.round((bytes / totalBytes) * 100)}%`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-y-1 gap-x-3 mt-2">
            {langEntries.map(([lang, bytes]) => (
              <div key={lang} className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[lang] || '#666' }} />
                  {lang}
                </span>
                <span className="text-on-surface font-medium">{Math.round((bytes / totalBytes) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
