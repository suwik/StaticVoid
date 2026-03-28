"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import { BasicMarksPlugin } from "@platejs/basic-nodes/react";
import { Loader2, Check, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Value } from "platejs";
import type { Intervention, InterventionResponse } from "@/lib/types";
import {
  detectCompletedParagraph,
  extractPlainText,
} from "@/lib/editor/paragraph-detection";

interface EssayEditorProps {
  sessionId: string;
  timeRemaining: number;
  initialContent?: string;
  onContentChange: (content: string) => void;
  onNewNudge: (nudge: Intervention) => void;
  disabled?: boolean;
  triggerInitialCheck?: boolean;
  checkTrigger?: number;
}

function textToPlateValue(text: string): Value {
  if (!text.trim()) return [{ type: "p", children: [{ text: "" }] }];
  return text.split(/\n\n/).map((p) => ({
    type: "p",
    children: [{ text: p }],
  }));
}

export function EssayEditor({
  sessionId,
  timeRemaining,
  initialContent = "",
  onContentChange,
  onNewNudge,
  disabled = false,
  triggerInitialCheck = false,
  checkTrigger = 0,
}: EssayEditorProps) {
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [checking, setChecking] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(initialContent);
  const timeRemainingRef = useRef(timeRemaining);
  // Pre-populate with restored paragraph count so AI doesn't re-check old content
  const initialParagraphCount = initialContent
    ? initialContent.split(/\n\n/).filter(Boolean).length
    : 0;
  const lastCheckedRef = useRef(initialParagraphCount);
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
      value: textToPlateValue(initialContent),
    },
    []
  );

  // Auto-save: debounce 10 seconds
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
          body: JSON.stringify({ session_id: sessionId, content: currentContent }),
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
    }, 10000);
  }, [sessionId]);

  // Cleanup on unmount or when disabled
  useEffect(() => {
    if (disabled && saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [disabled]);

  // Helper: send content to AI and emit nudge if warranted
  const sendInterventionCheck = useCallback(
    async (current: string) => {
      const paragraphs = current.split(/\n\n/).filter(Boolean);
      if (paragraphs.length === 0) return;

      const latestParagraph = paragraphs[paragraphs.length - 1];

      try {
        const res = await fetch("/api/intervene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            essaySoFar: current,
            latestParagraph,
            paragraphIndex: paragraphs.length - 1,
            timeRemaining: timeRemainingRef.current,
          }),
        });

        if (res.ok) {
          const intervention: InterventionResponse & { intervention_id?: string } =
            await res.json();
          if (intervention.should_intervene && intervention.type && intervention.message) {
            onNewNudgeRef.current({
              id: intervention.intervention_id ?? crypto.randomUUID(),
              session_id: sessionId,
              paragraph_index: paragraphs.length - 1,
              paragraph_text: latestParagraph,
              intervention_type: intervention.type,
              message: intervention.message,
              student_response: "pending",
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch {
        // Non-blocking
      }
    },
    [sessionId]
  );

  // Stuck detection: if no typing for 15s, keep nudging every 20s
  const lastActivityRef = useRef(Date.now());
  const lastStuckCheckRef = useRef(0);

  useEffect(() => {
    if (disabled) return;

    const interval = setInterval(async () => {
      const idleMs = Date.now() - lastActivityRef.current;
      const current = contentRef.current.trim();
      const timeSinceLastStuckCheck = Date.now() - lastStuckCheckRef.current;

      // If idle 15+ seconds, has content, and at least 20s since last stuck check
      if (idleMs >= 15000 && current.length > 20 && timeSinceLastStuckCheck >= 20000) {
        lastStuckCheckRef.current = Date.now();
        sendInterventionCheck(current);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId, disabled, sendInterventionCheck]);

  // Scenario demo: fire an initial check 3s after mount so Sooner responds immediately
  useEffect(() => {
    if (!triggerInitialCheck || !initialContent.trim() || disabled) return;
    const t = setTimeout(() => {
      sendInterventionCheck(initialContent);
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manual feedback button: fire immediately when checkTrigger increments
  const prevCheckTriggerRef = useRef(checkTrigger);
  useEffect(() => {
    if (checkTrigger === prevCheckTriggerRef.current) return;
    prevCheckTriggerRef.current = checkTrigger;
    const current = contentRef.current.trim();
    if (current) sendInterventionCheck(current);
  }, [checkTrigger, sendInterventionCheck]);

  // Sentence completion detection: trigger AI check when a sentence ends
  const initialSentences = initialContent.match(/[.!?](?:\s|$)/g);
  const lastSentenceCountRef = useRef(initialSentences ? initialSentences.length : 0);

  const checkForSentenceCompletion = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      // Count sentences (ending with . ? ! followed by space or end-of-string)
      const sentences = text.match(/[.!?](?:\s|$)/g);
      const sentenceCount = sentences ? sentences.length : 0;

      if (sentenceCount > lastSentenceCountRef.current) {
        lastSentenceCountRef.current = sentenceCount;
        sendInterventionCheck(text);
      }
    },
    [sendInterventionCheck]
  );

  // Periodic AI check every 15s — catches issues in long paragraphs
  const lastPeriodicContentRef = useRef("");
  useEffect(() => {
    if (disabled) return;

    const interval = setInterval(async () => {
      const current = contentRef.current.trim();
      if (!current || current === lastPeriodicContentRef.current) return;

      lastPeriodicContentRef.current = current;
      sendInterventionCheck(current);
    }, 15000);

    return () => clearInterval(interval);
  }, [sessionId, disabled, sendInterventionCheck]);

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
          const intervention: InterventionResponse & { intervention_id?: string } = await res.json();
          if (
            intervention.should_intervene &&
            intervention.type &&
            intervention.message
          ) {
            const nudge: Intervention = {
              id: intervention.intervention_id ?? crypto.randomUUID(),
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

        // Reset stuck detection on typing
        lastActivityRef.current = Date.now();

        const words = plainText.trim()
          ? plainText.trim().split(/\s+/).length
          : 0;
        if (words !== wordCountRef.current) {
          wordCountRef.current = words;
          forceRender((n) => n + 1);
        }

        checkForNewParagraph(snapshot);
        checkForSentenceCompletion(plainText);
        scheduleSave();
      }, 0);
    },
    [checkForNewParagraph, checkForSentenceCompletion, scheduleSave]
  );

  return (
    <div className="flex flex-1 flex-col relative">
      <Plate
        editor={editor}
        onValueChange={handleValueChange}
        readOnly={disabled}
      >
        <PlateContent
          className={cn(
            "flex-1 w-full min-h-[400px] rounded-xl border border-border",
            "bg-card shadow-sm",
            "p-8 md:p-10",
            "text-[1.0625rem] leading-[1.8] tracking-[-0.01em]",
            "font-sans text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "dark:shadow-none",
            "[&_[data-slate-placeholder]]:!text-muted-foreground/40 [&_[data-slate-placeholder]]:!opacity-100",
            "[&_[data-slate-placeholder]]:!text-[1.0625rem] [&_[data-slate-placeholder]]:!leading-[1.8]"
          )}
          placeholder="Begin writing your essay..."
          autoFocus
        />
      </Plate>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-3 px-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Save status */}
          <span
            className={cn(
              "flex items-center gap-1.5 transition-all duration-300",
              saveStatus === "idle" && "opacity-0",
              saveStatus === "saving" && "text-muted-foreground",
              saveStatus === "saved" && "text-emerald-500",
              saveStatus === "error" && "text-destructive"
            )}
          >
            {saveStatus === "saving" && <><Loader2 className="size-3 animate-spin" /> Saving...</>}
            {saveStatus === "saved" && <><Check className="size-3" /> Saved</>}
            {saveStatus === "error" && <><AlertCircle className="size-3" /> Save failed</>}
          </span>

          {/* Checking indicator */}
          {checking && (
            <span className="flex items-center gap-1.5 text-primary animate-pulse">
              <Sparkles className="size-3" /> AI reviewing...
            </span>
          )}
        </div>

        {/* Word count */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {wordCountRef.current} words
        </span>
      </div>
    </div>
  );
}
