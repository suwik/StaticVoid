import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { client } from "@/lib/gemini/client";
import {
  INTERVENTION_SYSTEM_PROMPT,
  buildInterventionPrompt,
} from "@/lib/gemini/prompts";
import type { InterventionResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sessionId,
      essaySoFar,
      latestParagraph,
      paragraphIndex,
      timeRemaining,
    } = body;

    // Fetch session info
    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Fetch student patterns
    const { data: patterns } = await supabase
      .from("patterns")
      .select("*")
      .eq("user_id", user.id)
      .eq("resolved", false)
      .order("frequency", { ascending: false })
      .limit(5);

    const patternSummary = patterns
      ?.map((p) => `${p.skill_area}: ${p.weakness_type} (${p.frequency}x)`)
      .join(", ");

    // Build prompt and call Gemini
    const userPrompt = buildInterventionPrompt({
      question: session.question,
      markScheme: session.mark_scheme,
      essaySoFar,
      latestParagraph,
      paragraphIndex,
      timeRemaining,
      timeLimit: session.time_limit,
      studentPatterns: patternSummary || undefined,
    });

    const interaction = await client.interactions.create({
      model: "gemini-3-flash-preview",
      input: userPrompt,
      system_instruction: INTERVENTION_SYSTEM_PROMPT,
      response_mime_type: "application/json",
    });

    const lastOutput = interaction.outputs?.[interaction.outputs.length - 1];
    const text = lastOutput?.type === "text"
      ? lastOutput.text
      : '{"should_intervene": false, "type": null, "message": null}';
    const intervention: InterventionResponse = JSON.parse(text);

    // Save intervention if triggered
    if (intervention.should_intervene && intervention.type && intervention.message) {
      await supabase.from("interventions").insert({
        session_id: sessionId,
        paragraph_index: paragraphIndex,
        paragraph_text: latestParagraph,
        intervention_type: intervention.type,
        message: intervention.message,
      });
    }

    return NextResponse.json(intervention);
  } catch (error) {
    console.error("Intervention error:", error);
    return NextResponse.json(
      { should_intervene: false, type: null, message: null },
      { status: 200 }
    );
  }
}
