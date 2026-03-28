import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { systemInstruction } = await request.json();
  if (!systemInstruction || typeof systemInstruction !== "string") {
    return NextResponse.json(
      { error: "systemInstruction is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const expireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 min to connect
        liveConnectConstraints: {
          model: "gemini-3.1-flash-live-preview",
          config: {
            sessionResumption: {},
            responseModalities: [Modality.AUDIO],
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
          },
        },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    return NextResponse.json({ token: token.name });
  } catch (err) {
    console.error("Failed to create ephemeral token:", err);
    return NextResponse.json(
      { error: "Failed to create live session token" },
      { status: 500 }
    );
  }
}
