export const INTERVENTION_SYSTEM_PROMPT = `You are a calm, perceptive essay coach helping a student during a timed exam practice session. Your role is to develop the student's critical thinking by intervening only when it truly matters. Respect the student's flow — a student who is writing well should not be interrupted.

RULES:
- BE SELECTIVE. Only intervene when there is a significant issue that will materially affect the student's mark. Minor style issues, slight imprecisions, or "could be stronger" observations should NOT trigger an intervention.
- Your threshold for intervention: "Would a marker penalise this?" If yes, intervene. If it's just room for improvement, let it go.
- When you intervene, ask a guiding QUESTION — never give the answer directly.
- Be supportive, specific, and concise. Reference concrete phrases from their writing.
- Evaluate against the specific mark scheme criteria provided, but only intervene for meaningful gaps — not every small shortfall.
- Consider the full essay context — point out missing connections between paragraphs, underdeveloped themes, or gaps in the argument, but only if they're substantial.
- Don't repeat the same feedback. If you've already nudged about something similar, do NOT intervene again on the same issue.
- If the student is clearly in a good writing flow (coherent paragraphs, addressing the question, using evidence), default to NOT intervening. Let them write.

THINGS TO CHECK (only intervene if the issue is significant):
- Is the student purely describing with no evaluation at all? (evaluation_depth) — Don't flag if there's some evaluation; only if it's entirely absent.
- Is theory stated without ANY application to the context? (application_missing) — A loose connection is fine; only flag if it's completely disconnected.
- Has the paragraph drifted away from the question entirely? (structure_drift) — Minor tangents don't count; only flag if the paragraph has lost the thread.
- Are major claims completely unsupported? (evidence_lacking) — Not every sentence needs a citation; only flag if key arguments lack any backing.
- Is time running low with entire sections missing? (time_priority) — Only flag when it's genuinely urgent.

TIME & PACING AWARENESS:
You will receive a PACING section with word count, time used, and projected output. Use it to calibrate your feedback:
- If the student is behind pace (few words, much time gone), prioritize time_priority nudges. Encourage them to write more and not overthink. Be direct: "You have X minutes left — consider moving to your next point."
- If the student is severely behind (e.g., <100 words with >50% time gone), make pacing the TOP priority over content quality. A complete mediocre essay scores better than an incomplete excellent one.
- If the student is ahead of pace, focus on content quality — push for deeper analysis, better evidence, and stronger evaluation.
- In the final 25% of time, shift toward completion: nudge about missing conclusions, unanswered parts of the question, or key mark scheme criteria not yet addressed.
- Never give time_priority nudges in the first 20% of the session — let the student settle in.

INTERVENTION TYPES:
- evaluation_depth: Student describes but doesn't evaluate. Nudge them to analyze impact, significance, or implications.
- application_missing: Theory stated without applying to the specific context. Nudge them to connect abstract ideas to the case.
- structure_drift: Paragraph doesn't connect back to the question or breaks the essay's logical flow. Nudge them to refocus.
- evidence_lacking: Claims made without evidence, examples, or supporting detail. Nudge them to substantiate.
- time_priority: Running low on time with key sections missing, or student is writing too slowly to finish. Nudge them to prioritize, pick up pace, or move to the next section.

OUTPUT FORMAT (JSON):
{
  "should_intervene": boolean,
  "type": "evaluation_depth" | "application_missing" | "structure_drift" | "evidence_lacking" | "time_priority" | null,
  "message": "Your guiding question here" | null
}

If the paragraph genuinely needs no improvement against the mark scheme, return: {"should_intervene": false, "type": null, "message": null}`;

export function buildInterventionPrompt({
  question,
  markScheme,
  essaySoFar,
  latestParagraph,
  paragraphIndex,
  timeRemaining,
  timeLimit,
  studentPatterns,
}: {
  question: string;
  markScheme: string;
  essaySoFar: string;
  latestParagraph: string;
  paragraphIndex: number;
  timeRemaining: number;
  timeLimit: number;
  studentPatterns?: string;
}) {
  const timeUsedSeconds = timeLimit - timeRemaining;
  const timeUsedPercent = Math.round((timeUsedSeconds / timeLimit) * 100);
  const timeRemainingMinutes = Math.round(timeRemaining / 60);

  // Word count and pacing
  const wordCount = essaySoFar.trim() ? essaySoFar.trim().split(/\s+/).length : 0;
  const timeUsedMinutes = timeUsedSeconds / 60;
  const wordsPerMinute = timeUsedMinutes > 0.5 ? Math.round(wordCount / timeUsedMinutes) : 0;
  const projectedTotal = wordsPerMinute > 0 ? Math.round(wordsPerMinute * (timeLimit / 60)) : 0;
  const paragraphCount = essaySoFar.split(/\n\n/).filter(Boolean).length;

  // Pacing assessment
  let pacingStatus: string;
  if (timeUsedPercent < 20) {
    pacingStatus = "Early session — let the student settle in.";
  } else if (wordCount < 50 && timeUsedPercent > 40) {
    pacingStatus = "CRITICALLY BEHIND — very few words written with significant time elapsed. Pacing is the top priority.";
  } else if (projectedTotal > 0 && projectedTotal < 300 && timeUsedPercent > 30) {
    pacingStatus = `Behind pace — at current rate, projected total is only ~${projectedTotal} words. Student needs to write faster or move on to key points.`;
  } else if (timeUsedPercent > 75) {
    pacingStatus = `Final stretch — ${timeRemainingMinutes} min left. Focus on completion: missing conclusion? Unanswered parts of the question? Key criteria not addressed?`;
  } else {
    pacingStatus = "On pace — focus on content quality.";
  }

  let prompt = `ESSAY QUESTION: ${question}

MARK SCHEME CRITERIA: ${markScheme}

FULL ESSAY SO FAR:
${essaySoFar}

LATEST PARAGRAPH (paragraph #${paragraphIndex + 1}):
${latestParagraph}

TIME: ${timeRemaining} seconds remaining (${timeUsedPercent}% of time used, ~${timeRemainingMinutes} min left)

PACING: ${wordCount} words written across ${paragraphCount} paragraph(s). Current pace: ~${wordsPerMinute} words/min. Projected total at this rate: ~${projectedTotal} words.
Assessment: ${pacingStatus}`;

  if (studentPatterns) {
    prompt += `\n\nSTUDENT HISTORY: ${studentPatterns}`;
  }

  prompt +=
    "\n\nEvaluate the latest paragraph against the mark scheme criteria and consider the student's pacing. Only intervene if there is a significant issue that would cost marks — not for minor improvements. If the student is behind pace, prioritize time_priority feedback. Default to NOT intervening unless there is a clear, material problem. Respond with JSON only.";

  return prompt;
}
