import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { client } from "@/lib/gemini/client";
import {
  INTERVENTION_SYSTEM_PROMPT,
  buildInterventionPrompt,
} from "@/lib/gemini/prompts";
import type { InterventionResponse, InterventionType, StudentResponse } from "@/lib/types";

const VALID_TYPES: InterventionType[] = [
  "evaluation_depth",
  "application_missing",
  "structure_drift",
  "evidence_lacking",
  "time_priority",
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { data: interventions, error } = await supabase
      .from("interventions")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(interventions ?? []);
  } catch (error) {
    console.error("Fetch interventions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interventions" },
      { status: 500 }
    );
  }
}

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

    // Final-30s silence: don't intervene in the last 30 seconds
    if (typeof timeRemaining === "number" && timeRemaining < 30) {
      return NextResponse.json({
        should_intervene: false,
        type: null,
        message: null,
      });
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
      response_format: {
        type: "object",
        properties: {
          should_intervene: { type: "boolean" },
          type: {
            type: "string",
            enum: VALID_TYPES,
            nullable: true,
          },
          message: { type: "string", nullable: true },
        },
        required: ["should_intervene", "type", "message"],
      },
      store: false,
    });

    const textOutput = interaction.outputs?.find(
      (o: { type: string }) => o.type === "text"
    ) as { type: "text"; text: string } | undefined;
    const text = textOutput?.text;
    if (!text) {
      console.warn("No text from Gemini");
      return NextResponse.json({
        should_intervene: false,
        type: null,
        message: null,
      });
    }

    let intervention: InterventionResponse;
    try {
      intervention = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", text);
      return NextResponse.json({
        should_intervene: false,
        type: null,
        message: null,
      });
    }

    // Validate intervention type
    if (
      intervention.type &&
      !VALID_TYPES.includes(intervention.type as InterventionType)
    ) {
      console.warn("Invalid intervention type from Gemini:", intervention.type);
      return NextResponse.json({
        should_intervene: false,
        type: null,
        message: null,
      });
    }

    // Save intervention if triggered
    if (intervention.should_intervene && intervention.type && intervention.message) {
      const { data: saved, error: insertError } = await supabase
        .from("interventions")
        .insert({
          session_id: sessionId,
          paragraph_index: paragraphIndex,
          paragraph_text: latestParagraph,
          intervention_type: intervention.type,
          message: intervention.message,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Failed to save intervention:", insertError);
      }

      // Record pattern for weakness tracking
      if (saved) {
        try {
          const skillArea = intervention.type.replace(/_/g, " ");
          // Upsert pattern: increment frequency if exists, create if not
          const { data: existingPattern } = await supabase
            .from("patterns")
            .select("id, frequency")
            .eq("user_id", user.id)
            .eq("weakness_type", intervention.type)
            .single();

          if (existingPattern) {
            await supabase
              .from("patterns")
              .update({
                frequency: existingPattern.frequency + 1,
                last_seen: new Date().toISOString(),
                resolved: false,
              })
              .eq("id", existingPattern.id);
          } else {
            await supabase.from("patterns").insert({
              user_id: user.id,
              skill_area: skillArea,
              weakness_type: intervention.type,
              frequency: 1,
              last_seen: new Date().toISOString(),
              resolved: false,
            });
          }
        } catch (patternErr) {
          // Don't fail the intervention if pattern tracking fails
          console.error("Pattern tracking error:", patternErr);
        }
      }

      return NextResponse.json({
        ...intervention,
        intervention_id: saved?.id ?? null,
      });
    }

    return NextResponse.json(intervention);
  } catch (error) {
    console.error("Intervention error:", error);
    return NextResponse.json(
      { error: "Intervention check failed", should_intervene: false, type: null, message: null },
      { status: 500 }
    );
  }
}

const VALID_RESPONSES: StudentResponse[] = ["pending", "dismissed", "read", "revised"];

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interventionId, studentResponse } = await request.json();

    if (!interventionId || !studentResponse) {
      return NextResponse.json(
        { error: "Missing interventionId or studentResponse" },
        { status: 400 }
      );
    }

    if (!VALID_RESPONSES.includes(studentResponse)) {
      return NextResponse.json(
        { error: "Invalid studentResponse value" },
        { status: 400 }
      );
    }

    // Update intervention — RLS ensures user can only update their own
    const { data, error } = await supabase
      .from("interventions")
      .update({ student_response: studentResponse })
      .eq("id", interventionId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Intervention not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Intervention update error:", error);
    return NextResponse.json(
      { error: "Failed to update intervention" },
      { status: 500 }
    );
  }
}
