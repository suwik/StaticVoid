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
    }

    setLoading(false);
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
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {markSchemeIsRendered ? (
          <div className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm overflow-auto">
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
                  <thead className="bg-muted">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-2 py-1 text-left font-medium">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-2 py-1 align-top">
                    {children}
                  </td>
                ),
                hr: () => <hr className="my-2 border-border" />,
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
      <Button type="submit" disabled={loading} className="w-full rounded-full h-10 font-semibold">
        {loading ? "Creating..." : "Start Session"}
      </Button>
    </form>
  );
}
