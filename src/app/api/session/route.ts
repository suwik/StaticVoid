import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, markScheme, timeLimit, startedAt } = await request.json();

    // Validate inputs
    if (!question?.trim() || !markScheme?.trim()) {
      return NextResponse.json(
        { error: "Question and mark scheme are required" },
        { status: 400 }
      );
    }

    if (
      typeof timeLimit !== "number" ||
      timeLimit < 60 ||
      timeLimit > 10800
    ) {
      return NextResponse.json(
        { error: "Time limit must be between 60 and 10800 seconds (1-180 minutes)" },
        { status: 400 }
      );
    }

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      question,
      mark_scheme: markScheme,
      time_limit: timeLimit,
    };

    if (startedAt && typeof startedAt === "string") {
      insertPayload.started_at = startedAt;
    }

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert(insertPayload)
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // Create empty essay for this session
    await supabase.from("essays").insert({
      session_id: session.id,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json(sessions ?? []);
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
