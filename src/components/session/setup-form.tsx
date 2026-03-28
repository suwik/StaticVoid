"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetupForm() {
  const [question, setQuestion] = useState("");
  const [markScheme, setMarkScheme] = useState("");
  const [timeLimit, setTimeLimit] = useState(45); // minutes
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        markScheme,
        timeLimit: timeLimit * 60, // convert to seconds
      }),
    });

    if (res.ok) {
      const session = await res.json();
      router.push(`/session/${session.id}`);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="question" className="text-sm font-medium">
          Essay Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          placeholder="Paste your essay question here..."
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="markScheme" className="text-sm font-medium">
          Mark Scheme Criteria
        </label>
        <textarea
          id="markScheme"
          value={markScheme}
          onChange={(e) => setMarkScheme(e.target.value)}
          required
          rows={5}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          placeholder="What criteria does this essay get marked against?"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="timeLimit" className="text-sm font-medium">
          Time Limit (minutes)
        </label>
        <input
          id="timeLimit"
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          min={5}
          max={180}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Creating..." : "Start Session"}
      </button>
    </form>
  );
}
