-- EssayCoach Database Schema
-- Run this in Supabase SQL Editor

-- Sessions: each practice session
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  mark_scheme text not null,
  time_limit integer not null, -- seconds
  status text default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Essays: essay content per session
create table public.essays (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  content text default '',
  updated_at timestamptz default now()
);

-- Interventions: every AI nudge triggered
create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  paragraph_index integer not null,
  paragraph_text text not null,
  intervention_type text not null check (intervention_type in ('evaluation_depth', 'application_missing', 'structure_drift', 'evidence_lacking', 'time_priority')),
  message text not null,
  student_response text default 'pending' check (student_response in ('pending', 'dismissed', 'read', 'revised')),
  created_at timestamptz default now()
);

-- Patterns: aggregated weaknesses per student
create table public.patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_area text not null,
  weakness_type text not null,
  frequency integer default 1,
  last_seen timestamptz default now(),
  resolved boolean default false
);

-- Enable Row Level Security
alter table public.sessions enable row level security;
alter table public.essays enable row level security;
alter table public.interventions enable row level security;
alter table public.patterns enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can CRUD own sessions"
  on public.sessions for all
  using (auth.uid() = user_id);

create policy "Users can CRUD own essays"
  on public.essays for all
  using (session_id in (select id from public.sessions where user_id = auth.uid()));

create policy "Users can CRUD own interventions"
  on public.interventions for all
  using (session_id in (select id from public.sessions where user_id = auth.uid()));

create policy "Users can CRUD own patterns"
  on public.patterns for all
  using (auth.uid() = user_id);

-- Indexes for performance
create index idx_sessions_user_id on public.sessions(user_id);
create index idx_essays_session_id on public.essays(session_id);
create index idx_interventions_session_id on public.interventions(session_id);
create index idx_patterns_user_id on public.patterns(user_id);
