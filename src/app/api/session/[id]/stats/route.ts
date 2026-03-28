import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Intervention, InterventionType } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the session belongs to this user and fetch session data
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Fetch all interventions for this session
    const { data: interventions, error: interventionsError } = await supabase
      .from("interventions")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (interventionsError) {
      return NextResponse.json(
        { error: interventionsError.message },
        { status: 500 }
      );
    }

    const typedInterventions = (interventions ?? []) as Intervention[];

    // Calculate nudges by type
    const nudgesByType: Record<string, number> = {};
    for (const intervention of typedInterventions) {
      const type = intervention.intervention_type as InterventionType;
      nudgesByType[type] = (nudgesByType[type] || 0) + 1;
    }

    // Calculate student responses breakdown
    const studentResponses: Record<string, number> = {};
    for (const intervention of typedInterventions) {
      const response = intervention.student_response;
      studentResponses[response] = (studentResponses[response] || 0) + 1;
    }

    // Calculate time used (from started_at to completed_at, or now if still active)
    const startedAt = new Date(session.started_at).getTime();
    const endedAt = session.completed_at
      ? new Date(session.completed_at).getTime()
      : Date.now();
    const timeUsedSeconds = Math.round((endedAt - startedAt) / 1000);

    const stats = {
      session_id: id,
      question: session.question,
      total_nudges: typedInterventions.length,
      nudges_by_type: nudgesByType,
      student_responses: studentResponses,
      time_limit: session.time_limit,
      time_used: timeUsedSeconds,
      status: session.status,
      interventions: typedInterventions,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
