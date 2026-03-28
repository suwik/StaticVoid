import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { client } from "@/lib/gemini/client";
import {
  INTERVENTION_SYSTEM_PROMPT,
  buildInterventionPrompt,
} from "@/lib/gemini/prompts";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";
import type { InterventionResponse, InterventionType } from "@/lib/types";

const VALID_TYPES: InterventionType[] = [
  "evaluation_depth",
  "application_missing",
  "structure_drift",
  "evidence_lacking",
  "time_priority",
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scenarioId } = await request.json();
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);

    if (!scenario) {
      return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });
    }

    // Calculate started_at so the timer shows the correct remaining time
    // elapsed = timeLimit - timeRemaining
    const elapsedMs = (scenario.timeLimit - scenario.timeRemaining) * 1000;
    const startedAt = new Date(Date.now() - elapsedMs).toISOString();

    // 1. Create session with backdated started_at
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        question: scenario.question,
        mark_scheme: scenario.markScheme,
        time_limit: scenario.timeLimit,
        started_at: startedAt,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error("Demo session creation error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create demo session" },
        { status: 500 }
      );
    }

    // 2. Create essay with pre-loaded content
    const { error: essayError } = await supabase.from("essays").insert({
      session_id: session.id,
      content: scenario.essayContent,
    });

    if (essayError) {
      console.error("Demo essay creation error:", essayError);
    }

    // 3. Generate the initial nudge via AI, fall back to scripted
    const paragraphs = scenario.essayContent.split(/\n\n/).filter(Boolean);
    const lastParagraph =
      paragraphs[scenario.nudge.paragraphIndex] ?? paragraphs[paragraphs.length - 1];

    let nudgeType = scenario.nudge.type;
    let nudgeMessage = scenario.nudge.message;

    // Try AI-generated nudge
    try {
      const userPrompt = buildInterventionPrompt({
        question: scenario.question,
        markScheme: scenario.markScheme,
        essaySoFar: scenario.essayContent,
        latestParagraph: lastParagraph,
        paragraphIndex: scenario.nudge.paragraphIndex,
        timeRemaining: scenario.timeRemaining,
        timeLimit: scenario.timeLimit,
      });

      const interaction = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: userPrompt,
        system_instruction: INTERVENTION_SYSTEM_PROMPT,
        response_mime_type: "application/json",
        response_format: {
          type: "object",
          properties: {
            should_intervene: { type: "boolean" },
            type: { type: "string", enum: VALID_TYPES, nullable: true },
            message: { type: "string", nullable: true },
          },
          required: ["should_intervene", "type", "message"],
        },
        store: false,
      });

      const textOutput = interaction.outputs?.find(
        (o: { type: string }) => o.type === "text"
      ) as { type: "text"; text: string } | undefined;

      if (textOutput?.text) {
        const parsed: InterventionResponse = JSON.parse(textOutput.text);
        if (parsed.should_intervene && parsed.type && parsed.message) {
          nudgeType = parsed.type;
          nudgeMessage = parsed.message;
        }
      }
    } catch (err) {
      console.error("AI nudge generation failed, using scripted fallback:", err);
    }

    const { error: nudgeError } = await supabase
      .from("interventions")
      .insert({
        session_id: session.id,
        paragraph_index: scenario.nudge.paragraphIndex,
        paragraph_text: lastParagraph,
        intervention_type: nudgeType,
        message: nudgeMessage,
        student_response: "pending",
      });

    if (nudgeError) {
      console.error("Demo nudge creation error:", nudgeError);
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Demo creation error:", error);
    return NextResponse.json(
      { error: "Failed to create demo" },
      { status: 500 }
    );
  }
}
