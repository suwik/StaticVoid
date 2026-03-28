import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, content, word_count } = body;

    if (!session_id || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: session_id, content" },
        { status: 400 }
      );
    }

    if (word_count !== undefined && typeof word_count !== "number") {
      return NextResponse.json(
        { error: "word_count must be a number" },
        { status: 400 }
      );
    }

    // Verify the session belongs to this user
    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Update essay content
    const updateData: { content: string; updated_at: string; word_count?: number } = {
      content,
      updated_at: new Date().toISOString(),
    };

    if (word_count !== undefined) {
      updateData.word_count = word_count;
    }

    const { data: essay, error: essayError } = await supabase
      .from("essays")
      .update(updateData)
      .eq("session_id", session_id)
      .select()
      .single();

    if (essayError) {
      return NextResponse.json(
        { error: essayError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(essay);
  } catch (error) {
    console.error("Essay save error:", error);
    return NextResponse.json(
      { error: "Failed to save essay" },
      { status: 500 }
    );
  }
}
