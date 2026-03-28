import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error(
    "GOOGLE_GEMINI_API_KEY environment variable is not set. " +
      "Add it to .env.local to enable AI interventions."
  );
}

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

export { client };
