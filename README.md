<div align="center">
  <img src="./download.png" alt="BuildTogether" width="420" />
  <p><b>A real-time collaboration platform for software teams.</b></p>
  <p>Discover projects, recruit contributors, manage work on a Kanban board,<br />and write code together in a collaborative editor.</p>
  <p>
    <a href="https://buildtogether-dev.vercel.app/">Live Demo</a>
    ·
    <a href="#getting-started">Getting Started</a>
    ·
    <a href="#features">Features</a>
  </p>
</div>

---

## Overview

BuildTogether is a full-stack web application that helps development teams organize around projects. Owners publish work and recruit contributors; members plan and execute using milestones, a Kanban board, and a real-time collaborative code editor. The frontend is built with React and Supabase, and access control is enforced at the database layer with Row Level Security.

## Features

**Access & Identity**

- Email/password and Google OAuth sign-in
- Automatic profile provisioning on registration
- Public profile pages with skills and bio

**Project Management**

- Public and private projects with lifecycle status (`recruiting`, `full`, `archived`)
- Application and review workflow for joining teams
- Team roles: `owner`, `admin`, `maintainer`, `member`
- Milestones, activity feed, and project starring

**Collaboration**

- Kanban task board with priorities, assignees, labels, and due dates
- Threaded comments with emoji reactions
- Real-time collaborative code editor (Yjs CRDT + CodeMirror 6 over Supabase Realtime)
- In-app notifications with per-type preferences
- Shareable public links for individual tasks

**Integration & Security**

- GitHub repository connection with file push
- Row Level Security on all 15 database tables
- Private project data accessible only to its members

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Routing & Data | React Router v7, TanStack Query v5 |
| Realtime | Supabase Realtime, Yjs, CodeMirror 6 |
| Rich Text | TipTap 3 |
| Backend | Supabase (Auth, Postgres, Storage, Realtime) |
| Quality | oxlint |

## Getting Started

### Prerequisites

- Node.js 20 or later
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/codebyuday/BuildTogether.git
cd BuildTogether
npm install
cp .env.example .env
npm run dev
```

The application starts at `http://localhost:5173`.

### Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable anon key |

### Database Setup

Execute the following in the Supabase SQL Editor, in order:

| # | Script | Purpose |
| --- | --- | --- |
| 1 | `supabase/new_project_setup.sql` | Schema (13 tables), policies, signup trigger |
| 2 | `supabase/code_editor_setup.sql` | `project_files` table and realtime |
| 3 | `supabase/add_missing_features.sql` | Comment replies, reactions, avatar storage, role constraint |
| 4 | `supabase/add_share_token.sql` | Public task share links |
| 5 | `supabase/add_task_updated_at.sql` | `updated_at` trigger for task statistics |
| 6 | `supabase/fix_recursion.sql` | `is_project_member()` helper and final RLS policies (required) |

> `supabase/migrations/001_initial_schema.sql` is the legacy schema, retained for reference only.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |

## Project Structure

```
buildtogether/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-level views
│   ├── hooks/         # Authentication, theme, and data hooks
│   └── lib/           # Supabase client and utilities
├── supabase/          # SQL schema and access policies
└── public/            # Static assets
```

## Database

Fifteen tables, all with Row Level Security enabled:

`profiles`, `projects`, `team_members`, `applications`, `milestones`, `tasks`, `comments`, `labels`, `task_labels`, `stars`, `notifications`, `activity_logs`, `repo_connections`, `project_files`, `comment_reactions`

Realtime is enabled for `tasks`, `notifications`, `applications`, `comments`, and `project_files`.
