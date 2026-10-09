<p align="center">
  <img src="./download.png" alt="BuildTogether" width="420" />
</p>

<p align="center">
  <strong>A real-time collaboration platform for developer teams.</strong><br />
  Publish projects, recruit contributors, plan work on a Kanban board,<br />
  and code together in a collaborative editor.
</p>

<p align="center">
  <a href="https://buildtogether-jade.vercel.app">Live Demo</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-features">Features</a>
</p>

---

## ✨ Features

- **Auth** — email/password + Google OAuth, auto-created profiles
- **Projects** — create public/private projects, recruit with status (`recruiting` / `full` / `archived`), star them
- **Applications** — apply to join a project, owners review & accept/reject
- **Teams** — roles (`owner` / `admin` / `maintainer` / `member`), activity feed per project
- **Kanban tasks** — columns, priorities, assignees, due dates, labels, threaded comments
- **Milestones** — phases with dates to track the roadmap
- **Real-time code editor** — collaborative editing (Yjs CRDT + CodeMirror 6) synced over Supabase Realtime
- **Notifications** — in-app, with per-type preferences
- **Profiles** — skills, bio, avatar upload, public profile pages
- **GitHub integration** — connect a repo, view stats, push files from the editor
- **Share links** — share a single task publicly via token
- **Security** — Row Level Security on all 15 tables; private data gated by membership

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Routing / data | React Router v7, TanStack Query v5 |
| Realtime | Supabase Realtime, Yjs, CodeMirror 6 |
| Editor | TipTap 3, CodeMirror 6 |
| Backend | Supabase (Auth, Postgres, Storage, Realtime) |
| Deploy | Vercel (auto-deploy on push to `main`) |
| Lint | oxlint |

## 🚀 Getting Started

**Prereqs:** Node.js 20+, a [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/codebyuday/BuildTogether.git
cd BuildTogether
npm install
cp .env.example .env    # then fill in your Supabase keys
npm run dev             # http://localhost:5173
```

### Environment variables

```bash
VITE_SUPABASE_URL=       # your project URL
VITE_SUPABASE_ANON_KEY=  # publishable anon key
```

### Database setup

Run these in the Supabase SQL Editor, **in order** (fresh project):

| # | File | What it does |
| --- | --- | --- |
| 1 | `supabase/new_project_setup.sql` | Full schema (13 tables), RLS, signup trigger |
| 2 | `supabase/code_editor_setup.sql` | `project_files` table + realtime |
| 3 | `supabase/add_missing_features.sql` | Comments replies, reactions, avatar storage, role constraint |
| 4 | `supabase/add_share_token.sql` | Public task share links |
| 5 | `supabase/add_task_updated_at.sql` | `updated_at` trigger for task stats |
| 6 | `supabase/fix_recursion.sql` | `is_project_member()` + final RLS policies (**required**) |

> `supabase/migrations/001_initial_schema.sql` is the legacy schema — kept for reference only; `new_project_setup.sql` supersedes it.

## 📜 Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |

## 🗄 Database

15 tables — `profiles`, `projects`, `team_members`, `applications`, `milestones`, `tasks`, `comments`, `labels`, `task_labels`, `stars`, `notifications`, `activity_logs`, `repo_connections`, `project_files`, `comment_reactions` — all with RLS enabled. Realtime is enabled for `tasks`, `notifications`, `applications`, `comments`, and `project_files`.

## 📁 Project Structure

```
buildtogether/
├── src/
│   ├── components/    # UI building blocks
│   ├── pages/         # Route-level screens (Landing, Dashboard, ProjectDetail, ...)
│   ├── hooks/         # useAuth, useTheme, data hooks
│   └── lib/           # Supabase client, utils
├── supabase/          # SQL schema + policies (run in order above)
└── public/            # Static assets
```

## 🚢 Deployment

Push to `main` — Vercel rebuilds and deploys automatically. Set the two env vars above in your Vercel project settings.
