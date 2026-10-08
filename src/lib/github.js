const GITHUB_API = 'https://api.github.com'

export async function fetchRepoStats(owner, repo) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`)
  if (!res.ok) return null
  const data = await res.json()
  return {
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    openIssues: data.open_issues_count || 0,
    language: data.language,
    description: data.description,
    defaultBranch: data.default_branch,
    updatedAt: data.updated_at,
  }
}

export async function fetchCommitActivity(owner, repo) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/stats/commit_activity`)
  if (!res.ok) return []
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.slice(-12).map(w => ({
    week: w.week,
    total: w.total,
    days: w.days,
  }))
}

export async function fetchContributors(owner, repo) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=10`)
  if (!res.ok) return []
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map(c => ({
    login: c.login,
    contributions: c.contributions,
    avatarUrl: c.avatar_url,
  }))
}

export async function fetchLanguages(owner, repo) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`)
  if (!res.ok) return {}
  return await res.json()
}

export function parseRepoUrl(url) {
  if (!url) return null
  const match = url.match(/github\.com[/:]([^/:]+)\/([^/?#]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

export async function pushToGitHub(owner, repo, filename, content, message) {
  const token = localStorage.getItem('gh_token')
  if (!token) throw new Error('GitHub token not found. Please connect your GitHub account in Settings.')

  const encodedContent = btoa(unescape(encodeURIComponent(content)))

  let sha = null
  try {
    const existing = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
    })
    if (existing.ok) {
      const data = await existing.json()
      sha = data.sha
    }
  } catch {}

  const body = { message, content: encodedContent }
  if (sha) body.sha = sha

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to push ${filename}`)
  }

  return { filename, status: 'pushed' }
}
