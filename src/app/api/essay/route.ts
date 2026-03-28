import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      return NextResponse.json(
        { error: "Missing sessionId query parameter" },
        { status: 400 }
      );
    }

    // Verify the session belongs to this user
    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const { data: essay, error: essayError } = await supabase
      .from("essays")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (essayError || !essay) {
      return NextResponse.json(
        { error: "Essay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(essay);
  } catch (error) {
    console.error("Essay fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch essay" },
      { status: 500 }
    );
  }
}

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
    // Accept both session_id and sessionId for compatibility
    const sessionId = body.session_id || body.sessionId;
    const { content } = body;

    if (!sessionId || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: session_id, content" },
        { status: 400 }
      );
    }

    // Verify the session belongs to this user
    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const { data: essay, error: essayError } = await supabase
      .from("essays")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
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
