"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileUp, Loader2, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PredefinedQuestion } from "@/lib/predefined-questions";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SetupFormProps {
  predefinedQuestions?: PredefinedQuestion[];
}

type InputMode = "predefined" | "pdf";

type PdfState =
  | { status: "idle" }
  | { status: "parsing"; fileName: string }
  | { status: "done"; fileName: string }
  | { status: "error"; fileName: string; message: string };

export function SetupForm({ predefinedQuestions = [] }: SetupFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>("predefined");
  const [question, setQuestion] = useState("");
  const [markScheme, setMarkScheme] = useState("");
  const [markSchemeIsRendered, setMarkSchemeIsRendered] = useState(false);
  const [timeLimit, setTimeLimit] = useState(45);
  const [loading, setLoading] = useState(false);
  const [pdfState, setPdfState] = useState<PdfState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function switchMode(mode: InputMode) {
    setInputMode(mode);
    // Reset only the source-specific state, not the filled fields
    if (mode === "predefined") setPdfState({ status: "idle" });
  }

  function handlePredefinedSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const index = Number(e.target.value);
    if (index === -1) return;
    const selected = predefinedQuestions[index];
    setQuestion(selected.question);
    setMarkScheme(selected.markScheme);
    setMarkSchemeIsRendered(true);
  }

  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfState({ status: "parsing", fileName: file.name });

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/parse-pdf", { method: "POST", body });
      const json = await res.json();

      if (!res.ok) {
        setPdfState({ status: "error", fileName: file.name, message: json.error ?? "Unknown error" });
        return;
      }

      setQuestion(json.question);
      setMarkScheme(json.markScheme);
      setMarkSchemeIsRendered(true);
      setPdfState({ status: "done", fileName: file.name });
    } catch (err) {
      setPdfState({
        status: "error",
        fileName: file.name,
        message: err instanceof Error ? err.message : "Failed to upload PDF",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      {/* Mode switcher */}
      <div className="space-y-3">
        <div className="flex rounded-lg border border-input p-1 gap-1">
          <button
            type="button"
            onClick={() => switchMode("predefined")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              inputMode === "predefined"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="size-3.5" />
            Predefined Question
          </button>
          <button
            type="button"
            onClick={() => switchMode("pdf")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              inputMode === "pdf"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileUp className="size-3.5" />
            Import from PDF
          </button>
        </div>

        {/* Predefined dropdown */}
        {inputMode === "predefined" && (
          <select
            defaultValue="-1"
            onChange={handlePredefinedSelect}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="-1" disabled>
              Select a question…
            </option>
            {predefinedQuestions.map((q, i) => (
              <option key={i} value={i}>
                {q.label}
              </option>
            ))}
          </select>
        )}

        {/* PDF upload */}
        {inputMode === "pdf" && (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handlePdfChange}
              disabled={pdfState.status === "parsing"}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={pdfState.status === "parsing"}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground disabled:cursor-wait disabled:opacity-60"
            >
              {pdfState.status === "parsing" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Parsing {pdfState.fileName}…
                </>
              ) : (
                <>
                  <FileUp className="size-4" />
                  Upload a PDF with the question &amp; mark scheme
                </>
              )}
            </button>
            {pdfState.status === "done" && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="size-3.5 shrink-0" />
                Parsed from {pdfState.fileName} — review and edit the fields below if needed.
              </p>
            )}
            {pdfState.status === "error" && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                {pdfState.message}
              </p>
            )}
          </div>
        )}
      </div>

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
