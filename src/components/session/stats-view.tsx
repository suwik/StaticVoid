"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Intervention, InterventionType } from "@/lib/types";

interface SessionStats {
  session_id: string;
  total_nudges: number;
  nudges_by_type: Record<string, number>;
  student_responses: Record<string, number>;
  time_limit: number;
  time_used: number;
  status: string;
  question: string;
  interventions: Intervention[];
}

const TYPE_LABELS: Record<InterventionType, string> = {
  evaluation_depth: "Evaluation Depth",
  application_missing: "Application Missing",
  structure_drift: "Structure Drift",
  evidence_lacking: "Evidence Lacking",
  time_priority: "Time Priority",
};

const TYPE_COLORS: Record<InterventionType, string> = {
  evaluation_depth: "bg-purple-500",
  application_missing: "bg-blue-500",
  structure_drift: "bg-amber-500",
  evidence_lacking: "bg-red-500",
  time_priority: "bg-orange-500",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

interface StatsViewProps {
  sessionId: string;
}

export function StatsView({ sessionId }: StatsViewProps) {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/session/${sessionId}/stats`);
        if (!res.ok) throw new Error("Failed to load stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500 animate-pulse">Loading stats...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-red-500">{error || "Stats not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const selfCorrections = stats.student_responses["revised"] || 0;
  const dismissed = stats.student_responses["dismissed"] || 0;
  const read = stats.student_responses["read"] || 0;
  const pending = stats.student_responses["pending"] || 0;
  const wordCount = stats.interventions.reduce(
    (_, i) => i.paragraph_text.split(/\s+/).filter(Boolean).length,
    0
  );

  const typeEntries = Object.entries(stats.nudges_by_type) as [
    InterventionType,
    number,
  ][];
  const maxTypeCount = Math.max(...typeEntries.map(([, c]) => c), 1);

  return (
    <div className="space-y-6">
      {/* Question */}
      {stats.question && (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Essay Question
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {stats.question}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Nudges Received</p>
          <p className="text-2xl font-bold">{stats.total_nudges}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Self-corrections</p>
          <p className="text-2xl font-bold">{selfCorrections}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Time Used</p>
          <p className="text-2xl font-bold">{formatDuration(stats.time_used)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Word Count</p>
          <p className="text-2xl font-bold">{wordCount}</p>
        </div>
      </div>

      {/* Intervention breakdown */}
      {typeEntries.length > 0 ? (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-semibold mb-4">Intervention Breakdown</h3>
          <div className="space-y-3">
            {typeEntries.map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {TYPE_LABELS[type] || type}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-2 rounded-full ${TYPE_COLORS[type] || "bg-zinc-400"}`}
                    style={{ width: `${(count / maxTypeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 text-center">
          <p className="text-green-600 font-medium">
            Great job, no nudges needed!
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            You stayed on track throughout the entire essay.
          </p>
        </div>
      )}

      {/* Response breakdown */}
      {stats.total_nudges > 0 && (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-semibold mb-3">How You Responded</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">
                {selfCorrections}
              </p>
              <p className="text-xs text-zinc-500">Revised</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{read}</p>
              <p className="text-xs text-zinc-500">Read</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-zinc-400">{dismissed}</p>
              <p className="text-xs text-zinc-500">Dismissed</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-zinc-300">{pending}</p>
              <p className="text-xs text-zinc-500">Unread</p>
            </div>
          </div>
        </div>
      )}

      {/* Intervention timeline */}
      {stats.interventions.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-semibold mb-3">Intervention Timeline</h3>
          <div className="space-y-3">
            {stats.interventions.map((intervention, i) => (
              <div
                key={intervention.id}
                className="flex gap-3 text-sm"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full shrink-0 mt-1 ${
                      TYPE_COLORS[intervention.intervention_type] || "bg-zinc-400"
                    }`}
                  />
                  {i < stats.interventions.length - 1 && (
                    <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {intervention.message}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-zinc-400">
                      Paragraph {intervention.paragraph_index + 1}
                    </span>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs text-zinc-400">
                      {TYPE_LABELS[intervention.intervention_type]}
                    </span>
                    <span className="text-xs text-zinc-400">·</span>
                    <span
                      className={`text-xs ${
                        intervention.student_response === "revised"
                          ? "text-green-500"
                          : intervention.student_response === "read"
                            ? "text-blue-500"
                            : intervention.student_response === "dismissed"
                              ? "text-zinc-400"
                              : "text-zinc-300"
                      }`}
                    >
                      {intervention.student_response}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => router.push("/session/new")}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
