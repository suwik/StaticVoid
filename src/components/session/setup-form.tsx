"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PredefinedQuestion } from "@/lib/predefined-questions";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SetupFormProps {
  predefinedQuestions?: PredefinedQuestion[];
}

export function SetupForm({ predefinedQuestions = [] }: SetupFormProps) {
  const [question, setQuestion] = useState("");
  const [markScheme, setMarkScheme] = useState("");
  const [markSchemeIsRendered, setMarkSchemeIsRendered] = useState(false);
  const [timeLimit, setTimeLimit] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handlePredefinedSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const index = Number(e.target.value);
    if (index === -1) return;
    const selected = predefinedQuestions[index];
    setQuestion(selected.question);
    setMarkScheme(selected.markScheme);
    setMarkSchemeIsRendered(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          markScheme,
          timeLimit: timeLimit * 60,
        }),
      });

      if (res.ok) {
        const session = await res.json();
        router.push(`/session/${session.id}`);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to create session. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {predefinedQuestions.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="predefined">Load a Predefined Question</Label>
          <select
            id="predefined"
            defaultValue="-1"
            onChange={handlePredefinedSelect}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="-1" disabled>
              Select a question...
            </option>
            {predefinedQuestions.map((q, i) => (
              <option key={i} value={i}>
                {q.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="question">Essay Question</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          rows={3}
          placeholder="Paste your essay question here..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="markScheme">Mark Scheme Criteria</Label>
          {markSchemeIsRendered && (
            <button
              type="button"
              onClick={() => setMarkSchemeIsRendered(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              Edit
            </button>
          )}
        </div>

        {markSchemeIsRendered ? (
          <div className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ children }) => (
                  <h3 className="font-semibold mt-3 mb-1">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-2">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>
                ),
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full border-collapse text-xs">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-zinc-100 dark:bg-zinc-800">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-left font-medium">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-zinc-200 dark:border-zinc-700 px-2 py-1 align-top">
                    {children}
                  </td>
                ),
                hr: () => <hr className="my-2 border-zinc-200 dark:border-zinc-700" />,
              }}
            >
              {markScheme}
            </ReactMarkdown>
          </div>
        ) : (
          <Textarea
            id="markScheme"
            value={markScheme}
            onChange={(e) => setMarkScheme(e.target.value)}
            required
            rows={5}
            placeholder="What criteria does this essay get marked against?"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
        <Input
          id="timeLimit"
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          min={5}
          max={180}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Start Session"}
      </Button>
    </form>
  );
}
