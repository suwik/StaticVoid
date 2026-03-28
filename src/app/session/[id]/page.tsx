"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { EssayEditor } from "@/components/editor/essay-editor";
import { Timer } from "@/components/editor/timer";
import { NudgePanel } from "@/components/editor/nudge-panel";
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
  const [nudges, setNudges] = useState<Intervention[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const completingRef = useRef(false);

  // Fetch session data on mount
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
        setSession(data);
        setTimeRemaining(data.time_limit); // already in seconds
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

  const handleNewNudge = useCallback((nudge: Intervention) => {
    setNudges((prev) => [nudge, ...prev]);
  }, []);

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
      await fetch("/api/essay", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: essayContentRef.current }),
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
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="text-zinc-500 animate-pulse">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="text-center space-y-3">
          <p className="text-red-500">{error || "Session not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-zinc-500 underline hover:text-zinc-700"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full">
      {/* Left: Editor area */}
      <div className="flex-1 flex flex-col p-6 min-w-0">
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-2">
            {session.question}
          </h1>
        </div>
        <EssayEditor
          sessionId={sessionId}
          timeRemaining={timeRemaining}
          onContentChange={handleContentChange}
          onNewNudge={handleNewNudge}
          disabled={isCompleted}
        />
      </div>

      {/* Right: Sidebar with timer + nudges */}
      <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
        {/* Timer section */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Time Remaining
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Timer
              timeLimit={session.time_limit}
              onTimeUpdate={handleTimeUpdate}
              onTimerExpired={handleTimerExpired}
              disabled={isCompleted}
            />
            <button
              onClick={completeSession}
              disabled={isCompleted}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isCompleted ? "Finishing..." : "Finish"}
            </button>
          </div>
        </div>

        {/* Nudge panel */}
        <NudgePanel
          nudges={nudges}
          onDismiss={handleDismissNudge}
          onResponseChange={handleResponseChange}
        />
      </div>
    </div>
  );
}
