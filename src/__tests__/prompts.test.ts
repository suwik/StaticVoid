import { describe, it, expect } from "vitest";
import {
  buildInterventionPrompt,
  INTERVENTION_SYSTEM_PROMPT,
} from "@/lib/gemini/prompts";

describe("INTERVENTION_SYSTEM_PROMPT", () => {
  it("should include all intervention types", () => {
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("evaluation_depth");
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("application_missing");
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("structure_drift");
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("evidence_lacking");
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("time_priority");
  });

  it("should instruct JSON output format", () => {
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("should_intervene");
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("JSON");
  });

  it("should emphasize asking questions not giving answers", () => {
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("QUESTION");
    expect(INTERVENTION_SYSTEM_PROMPT).toContain("never give the answer");
  });
});

describe("buildInterventionPrompt", () => {
  const baseParams = {
    question: "Evaluate the impact of globalisation on UK businesses.",
    markScheme: "AO1: Knowledge (4 marks), AO2: Application (4 marks), AO3: Analysis (6 marks), AO4: Evaluation (6 marks)",
    essaySoFar: "Globalisation refers to the increasing interconnectedness of economies worldwide.\n\nOne impact is increased competition from foreign firms.",
    latestParagraph: "One impact is increased competition from foreign firms.",
    paragraphIndex: 1,
    timeRemaining: 1200,
    timeLimit: 2700,
  };

  it("should include the essay question", () => {
    const prompt = buildInterventionPrompt(baseParams);
    expect(prompt).toContain(baseParams.question);
  });

  it("should include the mark scheme", () => {
    const prompt = buildInterventionPrompt(baseParams);
    expect(prompt).toContain(baseParams.markScheme);
  });

  it("should include the full essay so far", () => {
    const prompt = buildInterventionPrompt(baseParams);
    expect(prompt).toContain(baseParams.essaySoFar);
  });

  it("should include the latest paragraph with correct index", () => {
    const prompt = buildInterventionPrompt(baseParams);
    expect(prompt).toContain(baseParams.latestParagraph);
    expect(prompt).toContain("paragraph #2");
  });

  it("should calculate time used percentage correctly", () => {
    const prompt = buildInterventionPrompt(baseParams);
    // (2700 - 1200) / 2700 * 100 = 55.55... ≈ 56%
    expect(prompt).toContain("56%");
  });

  it("should include time remaining in seconds", () => {
    const prompt = buildInterventionPrompt(baseParams);
    expect(prompt).toContain("1200 seconds remaining");
  });

  it("should include student patterns when provided", () => {
    const prompt = buildInterventionPrompt({
      ...baseParams,
      studentPatterns: "evaluation_depth: weak analysis (3x)",
    });
    expect(prompt).toContain("STUDENT HISTORY");
    expect(prompt).toContain("evaluation_depth: weak analysis (3x)");
  });

  it("should not include student history section when no patterns", () => {
    const prompt = buildInterventionPrompt(baseParams);
    expect(prompt).not.toContain("STUDENT HISTORY");
  });

  it("should end with JSON instruction", () => {
    const prompt = buildInterventionPrompt(baseParams);
    expect(prompt).toContain("Respond with JSON only");
  });
});
