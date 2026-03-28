"use client";

import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import { BasicMarksPlugin } from "@platejs/basic-nodes/react";
import type { Value } from "platejs";
import type { Intervention, InterventionResponse } from "@/lib/types";
import {
  detectCompletedParagraph,
  extractPlainText,
} from "@/lib/editor/paragraph-detection";

interface EssayEditorProps {
  sessionId: string;
  timeRemaining: number;
  onContentChange: (content: string) => void;
  onNewNudge: (nudge: Intervention) => void;
  disabled?: boolean;
}

export function EssayEditor({
  sessionId,
  timeRemaining,
  onContentChange,
  onNewNudge,
  disabled = false,
}: EssayEditorProps) {
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [checking, setChecking] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef("");
  const timeRemainingRef = useRef(timeRemaining);
  const lastCheckedRef = useRef(0);
  const wordCountRef = useRef(0);
  const onContentChangeRef = useRef(onContentChange);
  const onNewNudgeRef = useRef(onNewNudge);
  const rafRef = useRef<number | null>(null);
  const [, forceRender] = useState(0);

  // Keep refs fresh without triggering re-renders
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  useEffect(() => {
    onNewNudgeRef.current = onNewNudge;
  }, [onNewNudge]);

  const editor = usePlateEditor(
    {
      plugins: [BasicMarksPlugin],
      value: [{ type: "p", children: [{ text: "" }] }],
    },
    []
  );

  // Auto-save: debounce 30 seconds
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(async () => {
      const currentContent = contentRef.current;
      if (!currentContent.trim()) return;

      setSaveStatus("saving");
      try {
        const res = await fetch("/api/essay", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, content: currentContent }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 3000);
        }
      } catch {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 30000);
  }, [sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const checkForNewParagraph = useCallback(
    async (value: Value) => {
      const result = detectCompletedParagraph(
        value,
        lastCheckedRef.current
      );
      if (!result) return;

      lastCheckedRef.current = result.completedParagraphIndex + 1;
      setChecking(true);

      try {
        const res = await fetch("/api/intervene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            essaySoFar: result.fullText,
            latestParagraph: result.completedParagraphText,
            paragraphIndex: result.completedParagraphIndex,
            timeRemaining: timeRemainingRef.current,
          }),
        });

        if (res.ok) {
          const intervention: InterventionResponse = await res.json();
          if (
            intervention.should_intervene &&
            intervention.type &&
            intervention.message
          ) {
            const nudge: Intervention = {
              id: crypto.randomUUID(),
              session_id: sessionId,
              paragraph_index: result.completedParagraphIndex,
              paragraph_text: result.completedParagraphText,
              intervention_type: intervention.type,
              message: intervention.message,
              student_response: "pending",
              created_at: new Date().toISOString(),
            };
            onNewNudgeRef.current(nudge);
          }
        }
      } catch (error) {
        console.error("Failed to check paragraph:", error);
      } finally {
        setChecking(false);
      }
    },
    [sessionId]
  );

  // Slate-react + React 19 causes infinite update loops if ANY work
  // happens synchronously inside onValueChange/onChange. Defer everything.
  const handleValueChange = useCallback(
    ({ value }: { value: Value }) => {
      // Deep copy value before deferring (Slate may mutate nodes)
      const snapshot = JSON.parse(JSON.stringify(value));

      setTimeout(() => {
        const plainText = extractPlainText(snapshot);
        contentRef.current = plainText;
        onContentChangeRef.current(plainText);

        const words = plainText.trim()
          ? plainText.trim().split(/\s+/).length
          : 0;
        if (words !== wordCountRef.current) {
          wordCountRef.current = words;
          forceRender((n) => n + 1);
        }

        checkForNewParagraph(snapshot);
        scheduleSave();
      }, 0);
    },
    [checkForNewParagraph, scheduleSave]
  );

  return (
    <div className="flex flex-1 flex-col relative">
      <Plate
        editor={editor}
        onValueChange={handleValueChange}
        readOnly={disabled}
      >
        <PlateContent
          className="flex-1 w-full min-h-[400px] rounded-lg border border-zinc-200 p-6 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-700 [&_[data-slate-placeholder]]:!text-zinc-400 [&_[data-slate-placeholder]]:!opacity-100"
          placeholder="Start writing your essay here..."
          autoFocus
        />
      </Plate>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-3">
          {/* Save status */}
          <span
            className={`text-xs transition-opacity duration-300 ${
              saveStatus === "idle" ? "opacity-0" : "opacity-100"
            } ${
              saveStatus === "saving"
                ? "text-zinc-400"
                : saveStatus === "saved"
                  ? "text-green-500"
                  : saveStatus === "error"
                    ? "text-red-400"
                    : ""
            }`}
          >
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </span>

          {/* Checking indicator */}
          {checking && (
            <span className="text-xs text-zinc-400 animate-pulse">
              AI reviewing...
            </span>
          )}
        </div>

        {/* Word count */}
        <span className="text-xs text-zinc-400">
          {wordCountRef.current} words
        </span>
      </div>
    </div>
  );
}
