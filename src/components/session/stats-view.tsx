"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, RotateCcw, Clock, FileText,
  CheckCircle2, Eye, XCircle, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

export function StatsView({ sessionId }: { sessionId: string }) {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/session/${sessionId}/stats`);
        if (!res.ok) throw new Error("Failed to load stats");
        setStats(await res.json());
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

  const typeEntries = Object.entries(stats.nudges_by_type) as [InterventionType, number][];
  const maxTypeCount = Math.max(...typeEntries.map(([, c]) => c), 1);

  const summaryCards = [
    { icon: MessageSquare, label: "Nudges Received", value: stats.total_nudges, color: "text-primary", bg: "bg-primary/10" },
    { icon: RotateCcw, label: "Self-corrections", value: selfCorrections, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Clock, label: "Time Used", value: formatDuration(stats.time_used), color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: FileText, label: "Word Count", value: wordCount, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-6">
      {stats.question && (
        <Card>
          <CardContent className="p-4">
            <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1">Essay Question</p>
            <p className="text-sm text-foreground/80">{stats.question}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("rounded-lg p-2", card.bg)}>
                <card.icon className={cn("size-4", card.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {typeEntries.length > 0 ? (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Intervention Breakdown</h3>
            <div className="space-y-3">
              {typeEntries.map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{TYPE_LABELS[type] || type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn("h-2 rounded-full transition-all", TYPE_COLORS[type] || "bg-zinc-400")}
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-emerald-600 font-medium">Great job, no nudges needed!</p>
            <p className="text-sm text-muted-foreground mt-1">You stayed on track throughout the entire essay.</p>
          </CardContent>
        </Card>
      )}

      {stats.total_nudges > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">How You Responded</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: CheckCircle2, value: selfCorrections, label: "Revised", color: "text-emerald-600" },
                { icon: Eye, value: read, label: "Read", color: "text-blue-600" },
                { icon: XCircle, value: dismissed, label: "Dismissed", color: "text-muted-foreground" },
                { icon: AlertCircle, value: pending, label: "Unread", color: "text-muted-foreground/50" },
              ].map((item) => (
                <div key={item.label} className="text-center space-y-1">
                  <item.icon className={cn("size-4 mx-auto", item.color)} />
                  <p className={cn("text-xl font-bold", item.color)}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.interventions.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">Intervention Timeline</h3>
            <div className="space-y-3">
              {stats.interventions.map((intervention, i) => (
                <div key={intervention.id} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className={cn("h-3 w-3 rounded-full shrink-0 mt-1", TYPE_COLORS[intervention.intervention_type] || "bg-zinc-400")} />
                    {i < stats.interventions.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-foreground/80">{intervention.message}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Paragraph {intervention.paragraph_index + 1}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{TYPE_LABELS[intervention.intervention_type]}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className={cn("text-xs",
                        intervention.student_response === "revised" ? "text-emerald-500" :
                        intervention.student_response === "read" ? "text-blue-500" :
                        intervention.student_response === "dismissed" ? "text-muted-foreground" : "text-muted-foreground/50"
                      )}>{intervention.student_response}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        <Button onClick={() => router.push("/session/new")}>Try Again</Button>
      </div>
    </div>
  );
}
