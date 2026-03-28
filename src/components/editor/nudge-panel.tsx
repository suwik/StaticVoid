"use client";

import { useEffect, useRef } from "react";
import type { Intervention, InterventionType } from "@/lib/types";

interface NudgePanelProps {
  nudges: Intervention[];
  onDismiss: (nudgeId: string) => void;
}

const TYPE_CONFIG: Record<
  InterventionType,
  { label: string; badgeColor: string; borderColor: string; bgColor: string }
> = {
  evaluation_depth: {
    label: "Evaluation Depth",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  application_missing: {
    label: "Application Missing",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  structure_drift: {
    label: "Structure Drift",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    bgColor: "bg-amber-50 dark:bg-amber-950",
  },
  evidence_lacking: {
    label: "Evidence Lacking",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  time_priority: {
    label: "Time Priority",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-800",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
};

export function NudgePanel({ nudges, onDismiss }: NudgePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(nudges.length);

  // Scroll to top when new nudge arrives (nudges are prepended)
  useEffect(() => {
    if (nudges.length > prevCountRef.current && panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevCountRef.current = nudges.length;
  }, [nudges.length]);

  const activeNudges = nudges.filter((n) => n.student_response !== "dismissed");
  const dismissedNudges = nudges.filter((n) => n.student_response === "dismissed");

  return (
    <div
      ref={panelRef}
      className="w-80 border-l border-zinc-200 p-4 space-y-3 overflow-y-auto dark:border-zinc-800"
    >
      <h2 className="text-sm font-semibold text-zinc-500">AI Coach</h2>

      {nudges.length === 0 && (
        <p className="mt-2 text-sm text-zinc-400">
          Feedback will appear here as you write.
        </p>
      )}

      {/* Active nudges */}
      {activeNudges.map((nudge, index) => {
        const config = TYPE_CONFIG[nudge.intervention_type];
        const isNew = index === 0 && nudges[0]?.id === nudge.id;

        return (
          <div
            key={nudge.id}
            className={`rounded-lg border p-3 text-sm transition-all duration-500 ${
              config.borderColor
            } ${config.bgColor} ${
              isNew ? "animate-in slide-in-from-right" : ""
            }`}
            style={
              isNew
                ? {
                    animation: "slideIn 0.3s ease-out",
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeColor}`}
              >
                {config.label}
              </span>
              <button
                onClick={() => onDismiss(nudge.id)}
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Dismiss nudge"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-zinc-700 dark:text-zinc-300">
              {nudge.message}
            </p>
            <span className="mt-1 block text-xs text-zinc-400">
              Paragraph {nudge.paragraph_index + 1}
            </span>
          </div>
        );
      })}

      {/* Dismissed nudges */}
      {dismissedNudges.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-500">
            {dismissedNudges.length} dismissed{" "}
            {dismissedNudges.length === 1 ? "nudge" : "nudges"}
          </summary>
          <div className="mt-2 space-y-2">
            {dismissedNudges.map((nudge) => {
              const config = TYPE_CONFIG[nudge.intervention_type];
              return (
                <div
                  key={nudge.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm opacity-60 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeColor}`}
                  >
                    {config.label}
                  </span>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {nudge.message}
                  </p>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
