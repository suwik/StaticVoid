"use client";

import type { ClientNudge } from "@/lib/types";

const typeLabels: Record<string, string> = {
  evaluation_depth: "Evaluation depth",
  application_missing: "Application missing",
  structure_drift: "Structure drift",
  evidence_lacking: "Evidence lacking",
  time_priority: "Time priority",
};

const typeColors: Record<string, string> = {
  evaluation_depth:
    "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  application_missing:
    "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
  structure_drift:
    "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950",
  evidence_lacking:
    "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  time_priority:
    "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950",
};

const typeTextColors: Record<string, string> = {
  evaluation_depth: "text-amber-800 dark:text-amber-200",
  application_missing: "text-blue-800 dark:text-blue-200",
  structure_drift: "text-purple-800 dark:text-purple-200",
  evidence_lacking: "text-red-800 dark:text-red-200",
  time_priority: "text-orange-800 dark:text-orange-200",
};

interface NudgePanelProps {
  nudges: ClientNudge[];
  onDismiss: (nudgeId: string) => void;
}

export function NudgePanel({ nudges, onDismiss }: NudgePanelProps) {
  if (nudges.length === 0) {
    return (
      <div className="w-80 border-l border-border p-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          AI Coach
        </h2>
        <p className="mt-2 text-sm text-muted-foreground/60">
          Feedback will appear here as you write.
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border p-4 space-y-3 overflow-y-auto">
      <h2 className="text-sm font-semibold text-muted-foreground">
        AI Coach
      </h2>
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className={`rounded-lg border p-3 text-sm transition-all ${
            typeColors[nudge.interventionType] ?? "border-amber-200 bg-amber-50"
          }`}
        >
          <p
            className={
              typeTextColors[nudge.interventionType] ??
              "text-amber-800 dark:text-amber-200"
            }
          >
            {nudge.message}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs opacity-60">
              {typeLabels[nudge.interventionType] ??
                nudge.interventionType.replace(/_/g, " ")}
            </span>
            <button
              onClick={() => onDismiss(nudge.id)}
              className="text-xs opacity-40 hover:opacity-100 transition-opacity"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
