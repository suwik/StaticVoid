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

## Distribution Strategy & Market

### Market
The global private tutoring market is valued at $130–150 billion in 2025, growing at 7–10% annually, projected to hit $200–250 billion by the early 2030s. Over a hundred million students sit essay-based exams every year globally. In the UK alone: 5.6 million GCSE results and 850,000 A-level results issued in 2025. In Poland, tens of thousands of students prepare annually for IB, A-levels, SAT, and university entrance exams.

Parents spend heavily. UK tutoring runs £25–50/hour, with Oxbridge/Ivy League prep hitting £100+/hour. Families easily spend $5,000–18,000/year on regular tutoring — per subject.

### The Gap
Every AI tutoring platform either answers questions or grades finished work. None sit alongside the student during a timed essay and teach in real time. Essay coaching is entirely unserved by technology — it's still human tutors one-on-one at premium hourly rates, or nothing at all.

### Distribution (B2B first)
1. **B2B to schools** — Sooner as a complementary offering. Teachers cannot provide paragraph-level essay feedback to 30 students simultaneously. Schools adopt it as a resource, students use it during study periods or at home, and the school gets data on where each student needs help.
2. **B2B through AI tutoring platforms** — Sooner as an integration. Tutoring platforms already have the students but none have real-time essay coaching. Sooner slots in as a feature within their existing product.

### Identified Targets
- **The Swan School (Warsaw, Poland):** Poland's first school offering comprehensive preparation for Oxford, Cambridge, Harvard, Stanford. Based in central Warsaw, operating since 2014. They teach IB, A-levels, SAT, critical thinking, and application essays. Their entire model is built around the exact skill Sooner teaches. Both briefed and green-lit.
- **We University (Warsaw, Poland):** Early adopter in AI-enabled education. Both briefed and green-lit for implementation.

### Unit Economics
API cost per student stays well under $5/month even at heavy usage (5 sessions/week, 20+ AI interventions per session). Charge $15–30/month as a subscription or $50–100/year per student for school licenses. The alternative is £50–100/hour human tutoring, or nothing at all.

### Business Subsite
Live at `/business` — targeting schools and institutions with the B2B pitch, ROI numbers, partner logos, and a contact CTA.

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
