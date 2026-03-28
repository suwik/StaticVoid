# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal
Real-time essay coaching platform: students practice essays under timed conditions while AI monitors writing and intervenes with guiding questions (not answers) when arguments go off track, evaluated against a specific mark scheme.

## Commands
```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm test             # Run all tests (vitest)
pnpm test:watch       # Watch mode
pnpm vitest run src/__tests__/prompts.test.ts  # Run single test file
```

## Tech Stack
- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** for styling
- **Supabase** (PostgreSQL + Auth + RLS) via `@supabase/ssr`
- **Google Gemini 2.0 Flash** (`@google/genai`) for low-latency AI interventions
- **Vitest** + **Testing Library** + **jsdom** for tests

## Next.js Version Warning
This uses Next.js 16 which has breaking changes from what you may know. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Architecture

### Authentication Flow
Middleware (`src/middleware.ts` → `src/lib/supabase/middleware.ts`) intercepts all requests, refreshes Supabase auth tokens, and redirects unauthenticated users to `/login`. Public routes: `/`, `/login`, `/auth`.

### Supabase Clients
- **Browser:** `src/lib/supabase/client.ts` — use in `"use client"` components
- **Server:** `src/lib/supabase/server.ts` — use in API routes and Server Components (async, cookie-based)

### AI Intervention Pipeline
1. Client sends paragraph to `POST /api/intervene`
2. API fetches session context + student's historical weakness patterns (top 5)
3. `buildInterventionPrompt()` constructs a prompt with: question, mark scheme, full essay, latest paragraph, time info, patterns
4. Gemini 2.0 Flash responds with JSON: `{ should_intervene, type, message }`
5. If intervening, saves to `interventions` table; returns response to client
6. On any error, returns `{ should_intervene: false }` — no nudge is better than breaking the student's flow

### AI Intervention Types
- `evaluation_depth` — Describes but doesn't evaluate
- `application_missing` — Theory without context
- `structure_drift` — Paragraph doesn't connect to question
- `evidence_lacking` — Claims without support
- `time_priority` — Low time, missing sections

### Core Loop
1. Student creates session with question + mark scheme → `POST /api/session`
2. Timer starts, student writes in editor
3. After each paragraph (double newline), AI evaluates against mark scheme
4. If issue detected → nudge appears (guiding question, not answer)
5. Session ends → stats show intervention patterns

## Conventions
- App Router only (not Pages Router)
- Server Components by default; `"use client"` only when needed
- API routes in `src/app/api/` for server-side logic (LLM calls, Supabase mutations)
- `@/*` import alias maps to `src/*`
- All types in `src/lib/types.ts` — matches Supabase table shapes
- Tests in `src/__tests__/` — type tests, prompt tests, and component tests

### Database
Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor to create tables.
