import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { client } from "@/lib/gemini/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const interaction = await client.interactions.create({
      model: "gemini-3-flash-preview",
      input: [
        {
          type: "document",
          data: base64,
          mime_type: "application/pdf",
        },
        {
          type: "text",
          text: `You are a teacher's assistant. Extract the essay question and grading criteria from this PDF.

Return a JSON object with exactly these two fields:
- "question": The essay question as a plain string. Include all sub-parts if present. If there are multiple questions, identify the primary one the student is expected to answer.
- "markScheme": The grading/marking criteria formatted as clean Markdown. Use headings, bullet points, and tables where appropriate to faithfully preserve the original structure.

If you cannot find a distinct question, infer what the student is being asked to write about from the mark scheme criteria.`,
        },
      ],
      response_mime_type: "application/json",
      response_format: {
        type: "object",
        properties: {
          question: { type: "string" },
          markScheme: { type: "string" },
        },
        required: ["question", "markScheme"],
      },
      store: false,
    });

    const textOutput = interaction.outputs?.find(
      (o: { type: string }) => o.type === "text"
    ) as { type: "text"; text: string } | undefined;

    if (!textOutput?.text) {
      return NextResponse.json(
        { error: "Gemini returned no output" },
        { status: 500 }
      );
    }

    let parsed: { question?: string; markScheme?: string };
    try {
      parsed = JSON.parse(textOutput.text);
    } catch {
      console.error("Failed to parse Gemini JSON:", textOutput.text);
      return NextResponse.json(
        { error: "Failed to parse Gemini response" },
        { status: 500 }
      );
    }

    if (!parsed.question?.trim() || !parsed.markScheme?.trim()) {
      return NextResponse.json(
        { error: "Could not extract question and mark scheme from this PDF" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      question: parsed.question.trim(),
      markScheme: parsed.markScheme.trim(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PDF parse error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
