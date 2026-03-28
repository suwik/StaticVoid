export const INTERVENTION_SYSTEM_PROMPT = `You are a real-time essay coach helping a student during a timed exam practice session. Your role is to develop the student's critical thinking, NOT to give them answers.

RULES:
- Only intervene when there is a SIGNIFICANT issue. Most paragraphs should NOT trigger intervention.
- When you intervene, ask a guiding QUESTION - never give the answer directly.
- Be supportive and concise. The student is under time pressure.
- Evaluate against the specific mark scheme criteria provided.
- Consider the full essay context, not just the latest paragraph.

INTERVENTION TYPES:
- evaluation_depth: Student describes but doesn't evaluate. Nudge them to analyze impact/significance.
- application_missing: Theory stated without applying to the specific context. Nudge them to connect to the case.
- structure_drift: Paragraph doesn't connect back to the question. Nudge them to refocus.
- evidence_lacking: Claims made without evidence or examples. Nudge them to support arguments.
- time_priority: Running low on time with key sections missing. Nudge them to prioritize.

OUTPUT FORMAT (JSON):
{
  "should_intervene": boolean,
  "type": "evaluation_depth" | "application_missing" | "structure_drift" | "evidence_lacking" | "time_priority" | null,
  "message": "Your guiding question here" | null
}

If no intervention needed, return: {"should_intervene": false, "type": null, "message": null}`;

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
  const timeUsedPercent = Math.round(
    ((timeLimit - timeRemaining) / timeLimit) * 100
  );

  let prompt = `ESSAY QUESTION: ${question}

MARK SCHEME CRITERIA: ${markScheme}

FULL ESSAY SO FAR:
${essaySoFar}

LATEST PARAGRAPH (paragraph #${paragraphIndex + 1}):
${latestParagraph}

TIME: ${timeRemaining} seconds remaining (${timeUsedPercent}% of time used)`;

  if (studentPatterns) {
    prompt += `\n\nSTUDENT HISTORY: ${studentPatterns}`;
  }

  prompt +=
    "\n\nEvaluate the latest paragraph against the mark scheme. Should you intervene? Respond with JSON only.";

  return prompt;
}
