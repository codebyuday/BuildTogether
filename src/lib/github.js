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
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}
