"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Intervention, InterventionType } from "@/lib/types";

interface SessionStats {
  session_id: string;
  total_nudges: number;
  nudges_by_type: Record<string, number>;
  student_responses: Record<string, number>;
  time_limit: number;
  time_used: number;
  word_count: number;
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

const TYPE_COLORS: Record<InterventionType, { bar: string; dot: string }> = {
  evaluation_depth: {
    bar: "bg-[var(--warm-lavender)]",
    dot: "bg-[var(--warm-lavender)]",
  },
  application_missing: {
    bar: "bg-[var(--warm-blue)]",
    dot: "bg-[var(--warm-blue)]",
  },
  structure_drift: {
    bar: "bg-[var(--warm-orange)]",
    dot: "bg-[var(--warm-orange)]",
  },
  evidence_lacking: {
    bar: "bg-red-400",
    dot: "bg-red-400",
  },
  time_priority: {
    bar: "bg-[var(--warm-orange)]/70",
    dot: "bg-[var(--warm-orange)]",
  },
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
        <p className="text-muted-foreground animate-pulse">Loading stats...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-destructive">{error || "Stats not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
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
  const wordCount = stats.word_count ?? 0;

  const typeEntries = Object.entries(stats.nudges_by_type) as [
    InterventionType,
    number,
  ][];
  const maxTypeCount = Math.max(...typeEntries.map(([, c]) => c), 1);

  return (
    <div className="space-y-6">
      {/* Question */}
      {stats.question && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1">
            Essay Question
          </p>
          <p className="text-sm text-foreground/80">
            {stats.question}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Nudges Received", value: stats.total_nudges },
          { label: "Self-corrections", value: selfCorrections },
          { label: "Time Used", value: formatDuration(stats.time_used) },
          { label: "Word Count", value: wordCount },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold font-heading mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Intervention breakdown */}
      {typeEntries.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-lg mb-4">Intervention Breakdown</h3>
          <div className="space-y-3">
            {typeEntries.map(([type, count]) => {
              const colors = TYPE_COLORS[type] || { bar: "bg-muted-foreground", dot: "bg-muted-foreground" };
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">
                      {TYPE_LABELS[type] || type}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all ${colors.bar}`}
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-emerald-600 font-medium">
            Great job, no nudges needed!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You stayed on track throughout the entire essay.
          </p>
        </div>
      )}

      {/* Response breakdown */}
      {stats.total_nudges > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-lg mb-3">How You Responded</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600">
                {selfCorrections}
              </p>
              <p className="text-xs text-muted-foreground">Revised</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: "var(--warm-blue)" }}>{read}</p>
              <p className="text-xs text-muted-foreground">Read</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-muted-foreground">{dismissed}</p>
              <p className="text-xs text-muted-foreground">Dismissed</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-muted-foreground/50">{pending}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </div>
        </div>
      )}

      {/* Intervention timeline */}
      {stats.interventions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-lg mb-4">Intervention Timeline</h3>
          <div className="space-y-3">
            {stats.interventions.map((intervention, i) => {
              const colors = TYPE_COLORS[intervention.intervention_type] || { dot: "bg-muted-foreground" };
              return (
                <div
                  key={intervention.id}
                  className="flex gap-3 text-sm"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full shrink-0 mt-1 ${colors.dot}`}
                    />
                    {i < stats.interventions.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-foreground/80">
                      {intervention.message}
                    </p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        Paragraph {intervention.paragraph_index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {TYPE_LABELS[intervention.intervention_type]}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span
                        className={`text-xs font-medium ${
                          intervention.student_response === "revised"
                            ? "text-emerald-600"
                            : intervention.student_response === "read"
                              ? "text-foreground/60"
                              : "text-muted-foreground"
                        }`}
                      >
                        {intervention.student_response}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="rounded-full px-5"
        >
          Back to Dashboard
        </Button>
        <Button
          onClick={() => router.push("/session/new")}
          className="rounded-full px-5 font-semibold"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
