# MASTERPLAN — EssayCoach

> This is the living roadmap. Claude MUST consult this before building features. If a user request conflicts with this plan, flag it and ask before proceeding. This plan can be updated — if the user asks to change direction, update this file accordingly.

## Hackathon Constraint
**Releasing today (2026-03-28).** Every feature must be simple, stable, and shippable. No speculative complexity. No features that risk breaking the core loop. If in doubt, leave it out.

---

## Vision
AI that coaches you while you write essays — catching mistakes in real-time so you can fix them, not after it's too late.

## The Problem
Feedback comes too late. Students write, submit, wait days, get it back covered in red marks. By then they've forgotten why they made those choices. They repeat the same mistakes.

## The Solution
Practice essays with AI watching alongside you. It reads every paragraph as you write. When something's off, it nudges you — a guiding question, not an answer. The student thinks and fixes it themselves, in the moment.

## Key Insight
Students don't need more feedback. They need feedback at the right moment — while they're still writing, when they can remember their reasoning and course-correct immediately. That's what a great tutor does sitting beside you. This is that, for everyone.

## One Metric That Matters
**Time to self-correct.** Over time, students catch their own mistakes before the AI does. The goal isn't AI dependency — it's building the skill to not need the AI anymore.

---

## Core User Flow (Priority: HACKATHON MVP)

### 1. Start a Session
- Select a question (AI-generated with mark scheme context and exam knowledge), paste your own, or upload image
- Mark scheme loads automatically or user provides it
- Set timer (preset exam lengths or custom)
- Start writing

### 2. Write Your Essay
- Clean editor, timer running
- AI reads silently in the background
- Student focuses on argument, not the AI

### 3. Get Nudged When Needed
AI checks writing regularly — not intrusively, but watching:
- On track with mark scheme?
- Describing when should be analyzing?
- Missing application to case study?
- Evaluation deep enough?

**If something's off:** Non-blocking nudge appears. Not "here's what to write" — a question:
- "You've explained the theory. What does this mean for [company in case study]?"
- "Strong analysis. What's the counter-argument?"
- "Consider: long-term vs short-term impact?"

**If on track:** Nothing. No interruption.

### 4. Finish and Review
- Session stats: how many nudges, which areas flagged, patterns emerging
- "You consistently rush evaluation sections"

### 5. Come Back Next Time (post-hackathon, low priority)
- AI remembers weaknesses from last session
- Pre-session reminder: "Last time you struggled with linking back to context"
- Intervenes faster on recurring patterns
- Tracks when old mistakes stop: "You haven't had an evaluation issue in 5 essays"

---

## Smart Detection & Timing

### Paragraph Focus Detection
- Knows which paragraph student is working on
- Tracks when they jump back to edit earlier sections
- Different feedback for new content vs revising
- Doesn't re-flag issues being actively fixed

### Pause Detection (Stuck Recognition)
- Learns natural writing rhythm (normal pauses vs stuck)
- Unusual pause → gentle check: "Having trouble with this section?"
- User can dismiss → AI backs off

### Time Awareness (CRITICAL — must influence all feedback)
- **Early:** Thorough feedback, room to explore
- **Mid-session:** Balanced nudges, keep momentum
- **Running low:** "Maximize marks" mode — prioritize highest-value actions
- **5 min left:** "Evaluation is your highest-value opportunity right now"
- **Final minute:** No new nudges, let them finish

### Writing Forward vs Editing Back
- New content → AI waits for natural breaks
- Jumped back to earlier paragraph → revision mode, adjust feedback
- Track self-corrections as positive signal
- "This revision strengthens your application — good catch"

### Smart Intervention Triggers
| Trigger | AI Action |
|---------|-----------|
| Paragraph completed | Check against mark scheme |
| Unusual pause (stuck) | Offer help, respect dismissal |
| Time milestone (10 min left) | Shift to high-impact advice |
| Editing earlier section | Adjust for revision context |
| Pattern from history | Flag earlier if recurring |
| Fast writing then stop | Different help than slow pause |

**Why multiple signals:** Single trigger = robotic. Multiple signals = context-aware, human-like, actually helpful. Intervene at the right moment with the right type of help.

---

## What Makes It Different
| Old Way | EssayCoach |
|---------|------------|
| Feedback after submission | Feedback while writing |
| "Needs more evaluation" (vague) | "What's the counter-argument here?" (actionable) |
| Same mistakes essay after essay | Catch and correct in real-time |
| Tutor costs $100/hour | AI coaching at scale |
| ChatGPT writes FOR you | AI makes YOU think better |

---

## Voice Coach (IMPLEMENTED)

Live voice conversation with the AI coach during essay writing sessions. Students can talk about their essay, ask for advice, discuss ideas, or work through tricky sections — and get spoken feedback in real-time.

**How it works:**
- Tab in the session sidebar switches between Nudges and Voice Coach
- "Start Voice Chat" connects to Gemini 3.1 Flash Live API via WebSocket
- Uses ephemeral tokens (API key never reaches the client)
- System instruction includes the essay question, mark scheme, and current essay content
- Audio input/output with real-time transcription display
- Mute/unmute and end call controls
- Coach guides thinking with questions — never writes the essay for the student
- Time-aware: nudges student to get back to writing if chatting too long

**Architecture:**
- `POST /api/live-token` — generates ephemeral token with locked model config
- `VoiceCoach` component — mic capture, WebSocket, audio playback, transcription
- `buildVoiceCoachPrompt()` — voice-specific system prompt with essay context

---

## Future Features (POST-HACKATHON — do NOT build now)

These are considered but explicitly deferred. Do not implement unless the user specifically requests.

- **Pre-Session Concept Check** — Quick diagnostic before writing starts
- **Pre-Session Weakness Reminder** — Show top patterns from history
- **Visual Argument Map** — Live diagram of logical flow as student writes
- **Rhythm Insights** — Track writing patterns (deletion, pauses, speed)
- **Post-Session Gap Exercises** — Targeted mini-exercises on weak spots
- **Mark Scheme Prediction Game** — Student guesses their mark before seeing feedback
- **Cross-Session Pattern Celebration** — "You haven't had this issue in 5 essays"
- **Multimodal Visual Explanations** — AI-generated diagrams for concepts
- **Collective Common Mistake Warnings** — Based on anonymized data
- **Voice Matching** — AI learns student's writing style for suggestions
