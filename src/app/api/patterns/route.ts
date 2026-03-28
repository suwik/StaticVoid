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

    const body = await request.json();
    const { skill_area, weakness_type } = body;

    if (!skill_area || !weakness_type) {
      return NextResponse.json(
        { error: "Missing required fields: skill_area, weakness_type" },
        { status: 400 }
      );
    }

    // Check if a pattern already exists for this user + skill_area + weakness_type
    const { data: existing } = await supabase
      .from("patterns")
      .select("*")
      .eq("user_id", user.id)
      .eq("skill_area", skill_area)
      .eq("weakness_type", weakness_type)
      .single();

    if (existing) {
      // Increment frequency and update last_seen, mark as unresolved
      const { data: pattern, error: updateError } = await supabase
        .from("patterns")
        .update({
          frequency: existing.frequency + 1,
          last_seen: new Date().toISOString(),
          resolved: false,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(pattern);
    } else {
      // Insert new pattern
      const { data: pattern, error: insertError } = await supabase
        .from("patterns")
        .insert({
          user_id: user.id,
          skill_area,
          weakness_type,
          frequency: 1,
          last_seen: new Date().toISOString(),
          resolved: false,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(pattern, { status: 201 });
    }
  } catch (error) {
    console.error("Pattern update error:", error);
    return NextResponse.json(
      { error: "Failed to update pattern" },
      { status: 500 }
    );
  }
}
