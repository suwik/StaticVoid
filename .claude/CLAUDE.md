# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Vision & Purpose
**EssayCoach:** AI that coaches you while you write essays — catching mistakes in real-time so you can fix them, not after it's too late.

Students practice essays under timed exam conditions. AI monitors their writing silently and intervenes with guiding questions (never answers) when arguments go off track, evaluated against the specific mark scheme. The goal is building self-correction instinct — over time students catch their own mistakes before the AI does. The AI should make itself unnecessary.

**Key principle:** Nudges are non-blocking questions ("What's the counter-argument here?"), not instructions. Time remaining MUST influence feedback (thorough early → high-impact-only when running low → silence in final minute).

## Masterplan
The full product roadmap, user flows, smart detection logic, and future features live in `.claude/MASTERPLAN.md`. **You MUST consult it before building any feature** to ensure alignment with the product vision.

**Rules:**
- If a task conflicts with the masterplan, flag it to the user and ask before proceeding
- If something feels inconsistent with the plan, ask clarifying questions — don't assume
- If the user asks to change direction or it seems natural to update it, confirm it and, update MASTERPLAN.md accordingly



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
- **Google Gemini 3 Flash** (`@google/genai` SDK, model: `gemini-3-flash-preview`) for low-latency AI interventions
- **Vitest** + **Testing Library** + **jsdom** for tests

## Next.js Version Warning
This uses Next.js 16 which has breaking changes from what you may know. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. For complex Next.js issues (hydration errors, RSC boundaries, parallel routes, data patterns, etc.), consult the `nextjs` and `next-best-practices` skills — but only when the standard docs aren't enough.

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
4. Gemini 3 Flash responds with JSON: `{ should_intervene, type, message }`
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

## Git Workflow
- **Always commit and create a PR** after completing a task — do not wait for the user to ask
- Create a feature branch for each piece of work
- Push and open a PR with a summary and test plan
- Use conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`)

## Conventions
- App Router only (not Pages Router)
- Server Components by default; `"use client"` only when needed
- API routes in `src/app/api/` for server-side logic (LLM calls, Supabase mutations)
- `@/*` import alias maps to `src/*`
- All types in `src/lib/types.ts` — matches Supabase table shapes
- Tests in `src/__tests__/` — type tests, prompt tests, and component tests

### Gemini API
- **Model:** `gemini-3-flash-preview` — `gemini-2.0-*` and `gemini-1.5-*` are deprecated, never use them
- **SDK:** `@google/genai` — legacy `@google/generative-ai` is deprecated, never use it
- **API:** Uses the Interactions API (`client.interactions.create()`) with `response_mime_type: "application/json"` for structured output. Do not use the legacy `generateContent` API.

**RULE: Before making ANY Gemini-related changes** (model selection, SDK usage, API calls, prompts, streaming, real-time features), you MUST consult the installed Gemini skills first. Do not rely on training data — it is outdated. The skills are the source of truth for current models, SDKs, and API patterns. If the skills don't cover your question or you have doubts, use WebSearch to verify against the latest Gemini documentation.

**Which skill to use:**
- **`gemini-api-dev`** — General Gemini development: model selection, SDK setup, multimodal content, function calling, structured outputs, current model specs. Start here for any Gemini work.
- **`gemini-interactions-api`** — The Interactions API (`client.interactions.create()`): stateful multi-turn chat, streaming via SSE, background tasks (Deep Research agent), migrating from `generateContent`. Use when building new conversational or agentic features.
- **`gemini-live-api-dev`** — Live API over WebSockets: real-time bidirectional audio/video/text streaming, voice activity detection, native audio, session management, ephemeral tokens. Use when adding real-time voice or video capabilities.

### Supabase & Database
- Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor to create tables
- For any Supabase config, RLS policies, migrations, or Postgres changes, consult the `supabase-postgres-best-practices` skill first
