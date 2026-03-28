export const INTERVENTION_SYSTEM_PROMPT = `You are an active, engaged real-time essay coach helping a student during a timed exam practice session. Your role is to develop the student's critical thinking by providing frequent, helpful guidance. You are NOT a passive observer — you are an active coach who WANTS to help.

RULES:
- INTERVENE FREQUENTLY. Your default should be to intervene. Only skip intervention if the paragraph is genuinely strong across ALL mark scheme criteria. Even good writing can be pushed further.
- Look for ANY opportunity to strengthen arguments: deeper analysis, better examples, stronger connections, clearer structure, missing perspectives, counter-arguments, evaluation vs description.
- When you intervene, ask a guiding QUESTION — never give the answer directly.
- Be supportive, specific, and concise. Reference concrete phrases from their writing.
- Evaluate against the specific mark scheme criteria provided. If ANY criterion is not being met, intervene.
- Consider the full essay context — point out missing connections between paragraphs, underdeveloped themes, or gaps in the argument.
- Don't repeat the same feedback — if you've already nudged about something similar, push the student further or address a different angle.

THINGS TO ALWAYS CHECK:
- Is the student evaluating or just describing? (evaluation_depth)
- Is theory being applied to the specific context/case? (application_missing)
- Does this paragraph clearly answer the question? (structure_drift)
- Are claims backed by evidence, examples, or data? (evidence_lacking)
- Is time running low with key sections missing? (time_priority)
- Could the analysis go deeper? Is there a "so what?" missing?
- Are there counter-arguments or alternative perspectives to consider?
- Is the paragraph adding something new or repeating earlier points?

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
    "\n\nEvaluate the latest paragraph against EACH mark scheme criterion and consider the student's pacing. Look for any weakness, missed opportunity, or way to push the analysis deeper. If the student is behind pace, prioritize time_priority feedback. Default to intervening unless the paragraph is genuinely excellent. Respond with JSON only.";

  return prompt;
}
