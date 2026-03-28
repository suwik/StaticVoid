# EssayCoach - Real-Time Essay Coaching Platform

## Project Goal
A platform where students practice essays under timed conditions while AI monitors their writing and intervenes in real-time when arguments go off track. The AI evaluates against the specific mark scheme criteria and provides guiding questions (not answers).

## Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database / Auth:** Supabase (PostgreSQL + Auth + RLS)
- **LLM:** Google Gemini API (Gemini 2.0 Flash for low-latency)
- **Package Manager:** pnpm
- **Deployment:** Frontend-only (Next.js API routes handle server-side logic)

## Setup
```bash
pnpm install
cp .env.local.example .env.local  # Fill in your keys
pnpm dev
```

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GOOGLE_GEMINI_API_KEY` - Google Gemini API key

### Database
Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor to create tables.

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (server-side)
│   │   ├── intervene/     # POST: paragraph → AI nudge
│   │   └── session/       # CRUD for sessions
│   ├── login/             # Auth page
│   ├── dashboard/         # Session list + new session
│   └── session/
│       ├── new/           # Session setup (question + mark scheme)
│       └── [id]/          # Essay editor + stats
├── components/            # React components
│   ├── editor/            # Essay editor, timer, nudge panel
│   ├── session/           # Setup form, stats view
│   └── auth/              # Auth form
└── lib/                   # Shared utilities
    ├── supabase/          # Supabase client helpers
    ├── gemini/            # Gemini client + prompts
    └── types.ts           # Shared TypeScript types
```

## Conventions
- Use App Router (not Pages Router)
- Server Components by default; add `"use client"` only when needed (interactivity, hooks)
- API routes in `src/app/api/` for server-side logic (LLM calls, Supabase mutations)
- Supabase client: use `client.ts` in browser, `server.ts` in API routes
- Keep components small and focused
- Use `@/*` import alias (maps to `src/*`)

## Core Loop
1. Student uploads question + mark scheme → creates session
2. Timer starts, student writes in editor
3. After each paragraph (double newline), AI evaluates against mark scheme
4. If issue detected → nudge appears (slide-in panel, guiding question)
5. Session ends → stats show intervention patterns

## AI Intervention Types
- `evaluation_depth` - Describes but doesn't evaluate
- `application_missing` - Theory without context
- `structure_drift` - Paragraph doesn't connect to question
- `evidence_lacking` - Claims without support
- `time_priority` - Low time, missing sections

@AGENTS.md
