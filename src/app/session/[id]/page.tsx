"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flag, Loader2 } from "lucide-react";
import { EssayEditor } from "@/components/editor/essay-editor";
import { Timer } from "@/components/editor/timer";
import { NudgePanel } from "@/components/editor/nudge-panel";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { Session, Intervention, StudentResponse } from "@/lib/types";

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const essayContentRef = useRef("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [initialEssayContent, setInitialEssayContent] = useState("");
  const [nudges, setNudges] = useState<Intervention[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const completingRef = useRef(false);

  // Fetch session data and restore essay on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/session/${sessionId}`);
        if (!res.ok) {
          throw new Error("Failed to load session");
        }
        const data: Session = await res.json();
        if (data.status === "completed") {
          router.replace(`/session/${sessionId}/stats`);
          return;
        }
        // Restore saved essay content before setting loading=false
        let savedContent = "";
        try {
          const essayRes = await fetch(`/api/essay?sessionId=${sessionId}`);
          if (essayRes.ok) {
            const essay = await essayRes.json();
            savedContent = essay.content || "";
          }
        } catch {
          // Non-blocking: start with empty editor if restore fails
        }

        // Restore nudges from database
        let savedNudges: Intervention[] = [];
        try {
          const nudgesRes = await fetch(`/api/intervene?sessionId=${sessionId}`);
          if (nudgesRes.ok) {
            savedNudges = await nudgesRes.json();
          }
        } catch {
          // Non-blocking: start with empty nudges if restore fails
        }

        // Calculate remaining time from started_at so refreshes don't reset the timer
        const elapsedSeconds = Math.floor(
          (Date.now() - new Date(data.started_at).getTime()) / 1000
        );
        const remaining = Math.max(0, data.time_limit - elapsedSeconds);

        setSession(data);
        setTimeRemaining(remaining);
        essayContentRef.current = savedContent;
        setInitialEssayContent(savedContent);
        setNudges(savedNudges);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId, router]);

  const handleTimeUpdate = useCallback((seconds: number) => {
    setTimeRemaining(seconds);
  }, []);

  // Track whether an AI-generated nudge has appeared (beyond the initial DB load)
  const aiNudgeCountRef = useRef(0);

  const handleNewNudge = useCallback((nudge: Intervention) => {
    aiNudgeCountRef.current += 1;
    setNudges((prev) => {
      // Deduplicate: don't add if this nudge ID already exists
      if (prev.some((n) => n.id === nudge.id)) return prev;
      return [nudge, ...prev];
    });
  }, []);

  // Demo fallback: if this session matches a demo scenario with a fallback nudge,
  // show it after a delay — but only if no AI nudge has been generated yet.
  useEffect(() => {
    if (!session || isCompleted) return;

    const scenario = DEMO_SCENARIOS.find(
      (s) => s.question === session.question && s.fallbackNudge
    );
    if (!scenario?.fallbackNudge) return;

    const fallback = scenario.fallbackNudge;
    const timer = setTimeout(async () => {
      // Only fire if no AI nudge has appeared
      if (aiNudgeCountRef.current > 0) return;

      // Persist the fallback nudge to DB
      const paragraphs = scenario.essayContent.split(/\n\n/).filter(Boolean);
      let savedId: string | null = null;
      try {
        const res = await fetch("/api/intervene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            essaySoFar: essayContentRef.current || scenario.essayContent,
            latestParagraph: paragraphs[fallback.paragraphIndex] ?? paragraphs[paragraphs.length - 1],
            paragraphIndex: fallback.paragraphIndex,
            timeRemaining: timeRemaining - fallback.delaySeconds,
          }),
        });
        // If AI responded with an intervention, use that instead
        if (res.ok) {
          const data = await res.json();
          if (data.should_intervene && data.type && data.message) {
            handleNewNudge({
              id: data.intervention_id ?? crypto.randomUUID(),
              session_id: sessionId,
              paragraph_index: fallback.paragraphIndex,
              paragraph_text: paragraphs[fallback.paragraphIndex] ?? "",
              intervention_type: data.type,
              message: data.message,
              student_response: "pending",
              created_at: new Date().toISOString(),
            });
            return;
          }
        }
      } catch {
        // AI failed — fall through to scripted fallback
      }

      // AI didn't produce a nudge — use the scripted fallback
      // Save it to DB directly
      try {
        const saveRes = await fetch("/api/demo/nudge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            type: fallback.type,
            message: fallback.message,
            paragraphIndex: fallback.paragraphIndex,
            paragraphText: paragraphs[fallback.paragraphIndex] ?? "",
          }),
        });
        const saved = saveRes.ok ? await saveRes.json() : null;

        setNudges((prev) => [
          {
            id: saved?.id ?? crypto.randomUUID(),
            session_id: sessionId,
            paragraph_index: fallback.paragraphIndex,
            paragraph_text: paragraphs[fallback.paragraphIndex] ?? "",
            intervention_type: fallback.type,
            message: fallback.message,
            student_response: "pending",
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      } catch {
        // Last resort: show without persisting
        setNudges((prev) => [
          {
            id: crypto.randomUUID(),
            session_id: sessionId,
            paragraph_index: fallback.paragraphIndex,
            paragraph_text: "",
            intervention_type: fallback.type,
            message: fallback.message,
            student_response: "pending",
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    }, fallback.delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [session, sessionId, isCompleted, timeRemaining, handleNewNudge]);

  const handleDismissNudge = useCallback((nudgeId: string) => {
    setNudges((prev) =>
      prev.map((n) =>
        n.id === nudgeId
          ? { ...n, student_response: "dismissed" as const }
          : n
      )
    );
  }, []);

  const handleResponseChange = useCallback(
    (nudgeId: string, response: StudentResponse) => {
      setNudges((prev) =>
        prev.map((n) => (n.id === nudgeId ? { ...n, student_response: response } : n))
      );
    },
    []
  );

  const handleContentChange = useCallback((content: string) => {
    essayContentRef.current = content;
  }, []);

  // Complete the session (timer expiry or manual finish)
  const completeSession = useCallback(async () => {
    if (completingRef.current || isCompleted) return;
    completingRef.current = true;
    setIsCompleted(true);

    try {
      // Save final essay content (await to ensure it completes before marking session done)
      await fetch("/api/essay", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, content: essayContentRef.current }),
      });

      await fetch(`/api/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString(),
        }),
      });

      router.push(`/session/${sessionId}/stats`);
    } catch (err) {
      console.error("Failed to complete session:", err);
      router.push(`/session/${sessionId}/stats`);
    }
  }, [sessionId, isCompleted, router]);

  const handleTimerExpired = useCallback(() => {
    completeSession();
  }, [completeSession]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col h-full">
        <div className="h-14 border-b border-border bg-muted/20 animate-pulse" />
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 p-6 lg:p-8">
            <div className="h-full rounded-2xl border border-border bg-muted/10 animate-pulse" />
          </div>
          <div className="w-80 border-l border-border bg-surface-sunken">
            <div className="p-5 border-b border-border space-y-3">
              <div className="h-3 w-24 bg-muted/30 rounded-full animate-pulse" />
              <div className="h-8 w-32 bg-muted/20 rounded-full animate-pulse" />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-4 w-20 bg-muted/30 rounded-full animate-pulse" />
              <div className="h-24 bg-muted/10 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">{error || "Session not found"}</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-full px-5"
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const timeProgress = session.time_limit > 0
    ? (timeRemaining / session.time_limit) * 100
    : 0;

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Session header bar */}
      <div className="flex items-center gap-3 h-14 px-6 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <p className="text-sm text-muted-foreground truncate flex-1">
          {session.question}
        </p>
        <Badge variant="outline" className="shrink-0 rounded-full">
          {isCompleted ? "Completed" : "In Progress"}
        </Badge>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Editor area */}
        <div className="flex-1 flex flex-col p-6 lg:p-8 min-w-0">
          <EssayEditor
            sessionId={sessionId}
            timeRemaining={timeRemaining}
            initialContent={initialEssayContent}
            onContentChange={handleContentChange}
            onNewNudge={handleNewNudge}
            disabled={isCompleted}
          />
        </div>

        {/* Right: Sidebar with timer + nudges */}
        <aside className="w-80 border-l border-border bg-surface-sunken flex flex-col shrink-0">
          {/* Timer section */}
          <div className="p-5 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                Time Remaining
              </span>
              <Button
                onClick={completeSession}
                disabled={isCompleted}
                size="sm"
                className="gap-1.5 rounded-full"
              >
                {isCompleted ? (
                  <><Loader2 className="size-3 animate-spin" /> Finishing...</>
                ) : (
                  <><Flag className="size-3" /> Finish</>
                )}
              </Button>
            </div>
            <Timer
              timeLimit={session.time_limit}
              initialSeconds={timeRemaining}
              onTimeUpdate={handleTimeUpdate}
              onTimerExpired={handleTimerExpired}
              disabled={isCompleted}
            />
            <Progress value={timeProgress} className="h-1.5" />
          </div>

          {/* Nudge panel */}
          <NudgePanel
            nudges={nudges}
            onDismiss={handleDismissNudge}
            onResponseChange={handleResponseChange}
          />
        </aside>
      </div>
    </div>
  );
}
