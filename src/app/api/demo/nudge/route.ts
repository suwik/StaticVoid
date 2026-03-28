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

    const { sessionId, type, message, paragraphIndex, paragraphText } =
      await request.json();

    const { data, error } = await supabase
      .from("interventions")
      .insert({
        session_id: sessionId,
        paragraph_index: paragraphIndex,
        paragraph_text: paragraphText || "",
        intervention_type: type,
        message,
        student_response: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save fallback nudge:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Fallback nudge error:", error);
    return NextResponse.json({ error: "Failed to save nudge" }, { status: 500 });
  }
}
