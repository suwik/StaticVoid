import { describe, it, expect } from "vitest";
import {
  buildInterventionPrompt,
  INTERVENTION_SYSTEM_PROMPT,
} from "@/lib/gemini/prompts";
import type { InterventionResponse, InterventionType } from "@/lib/types";

describe("Intervention API contract", () => {
  describe("System prompt", () => {
    it("should define all 5 intervention types", () => {
      const types: InterventionType[] = [
        "evaluation_depth",
        "application_missing",
        "structure_drift",
        "evidence_lacking",
        "time_priority",
      ];
      for (const type of types) {
        expect(INTERVENTION_SYSTEM_PROMPT).toContain(type);
      }
    });

    it("should require JSON output format", () => {
      expect(INTERVENTION_SYSTEM_PROMPT).toContain("should_intervene");
      expect(INTERVENTION_SYSTEM_PROMPT).toContain("JSON");
    });

    it("should enforce asking questions not giving answers", () => {
      expect(INTERVENTION_SYSTEM_PROMPT).toContain("QUESTION");
      expect(INTERVENTION_SYSTEM_PROMPT).toContain("never give the answer");
    });

    it("should be selective about when to intervene", () => {
      expect(INTERVENTION_SYSTEM_PROMPT).toContain("BE SELECTIVE");
    });

    it("should list common issues to watch for", () => {
      expect(INTERVENTION_SYSTEM_PROMPT).toContain("no evaluation at all");
      expect(INTERVENTION_SYSTEM_PROMPT).toContain("without evidence");
    });
  });

  describe("buildInterventionPrompt", () => {
    const baseParams = {
      question: "Evaluate the impact of globalisation on UK businesses.",
      markScheme:
        "AO1: Knowledge (4 marks), AO2: Application (4 marks), AO3: Analysis (6 marks), AO4: Evaluation (6 marks)",
      essaySoFar:
        "Globalisation refers to the increasing interconnectedness of economies worldwide.\n\nOne impact is increased competition from foreign firms.",
      latestParagraph:
        "One impact is increased competition from foreign firms.",
      paragraphIndex: 1,
      timeRemaining: 1200,
      timeLimit: 2700,
    };

    it("should include essay question and mark scheme", () => {
      const prompt = buildInterventionPrompt(baseParams);
      expect(prompt).toContain(baseParams.question);
      expect(prompt).toContain(baseParams.markScheme);
    });

    it("should include full essay and latest paragraph", () => {
      const prompt = buildInterventionPrompt(baseParams);
      expect(prompt).toContain(baseParams.essaySoFar);
      expect(prompt).toContain("LATEST PARAGRAPH");
      expect(prompt).toContain(baseParams.latestParagraph);
    });

    it("should include paragraph number (1-indexed)", () => {
      const prompt = buildInterventionPrompt(baseParams);
      expect(prompt).toContain("paragraph #2");
    });

    it("should calculate time used percentage correctly", () => {
      const prompt = buildInterventionPrompt(baseParams);
      // (2700 - 1200) / 2700 = 55.6% → rounds to 56%
      expect(prompt).toContain("56%");
    });

    it("should include time remaining in seconds", () => {
      const prompt = buildInterventionPrompt(baseParams);
      expect(prompt).toContain("1200 seconds remaining");
    });

    it("should include student patterns when provided", () => {
      const prompt = buildInterventionPrompt({
        ...baseParams,
        studentPatterns: "Analysis: evaluation_depth (3x)",
      });
      expect(prompt).toContain("STUDENT HISTORY");
      expect(prompt).toContain("evaluation_depth (3x)");
    });

    it("should not include student history when no patterns", () => {
      const prompt = buildInterventionPrompt(baseParams);
      expect(prompt).not.toContain("STUDENT HISTORY");
    });

    it("should end with JSON instruction", () => {
      const prompt = buildInterventionPrompt(baseParams);
      expect(prompt).toContain("Respond with JSON only");
    });

    it("should show high time usage when near end", () => {
      const prompt = buildInterventionPrompt({
        ...baseParams,
        timeRemaining: 300, // 5 min left of 45 min
        timeLimit: 2700,
      });
      // (2700 - 300) / 2700 = 88.9% → rounds to 89%
      expect(prompt).toContain("89%");
    });
  });

  describe("InterventionResponse parsing", () => {
    it("should parse a valid intervention response", () => {
      const raw = '{"should_intervene":true,"type":"evaluation_depth","message":"What does this mean?"}';
      const response: InterventionResponse = JSON.parse(raw);
      expect(response.should_intervene).toBe(true);
      expect(response.type).toBe("evaluation_depth");
      expect(response.message).toBe("What does this mean?");
    });

    it("should parse a no-intervention response", () => {
      const raw = '{"should_intervene":false,"type":null,"message":null}';
      const response: InterventionResponse = JSON.parse(raw);
      expect(response.should_intervene).toBe(false);
      expect(response.type).toBeNull();
      expect(response.message).toBeNull();
    });

    it("should handle all intervention types", () => {
      const types: InterventionType[] = [
        "evaluation_depth",
        "application_missing",
        "structure_drift",
        "evidence_lacking",
        "time_priority",
      ];
      for (const type of types) {
        const raw = `{"should_intervene":true,"type":"${type}","message":"test"}`;
        const response: InterventionResponse = JSON.parse(raw);
        expect(response.type).toBe(type);
      }
    });
  });
});
