import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";

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

    // 3. Create the scripted initial nudge
    const paragraphs = scenario.essayContent.split(/\n\n/).filter(Boolean);
    const { error: nudgeError } = await supabase
      .from("interventions")
      .insert({
        session_id: session.id,
        paragraph_index: scenario.nudge.paragraphIndex,
        paragraph_text:
          paragraphs[scenario.nudge.paragraphIndex] ?? paragraphs[paragraphs.length - 1],
        intervention_type: scenario.nudge.type,
        message: scenario.nudge.message,
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
