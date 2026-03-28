"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Search,
  AppWindow,
  Compass,
  BookOpen,
  Timer,
  X,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Intervention, InterventionType, StudentResponse } from "@/lib/types";

interface NudgePanelProps {
  nudges: Intervention[];
  onDismiss: (nudgeId: string) => void;
  onResponseChange?: (nudgeId: string, response: StudentResponse) => void;
}

const TYPE_CONFIG: Record<
  InterventionType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  evaluation_depth: {
    label: "Evaluation Depth",
    icon: Search,
    accentColor: "text-purple-500",
    badgeColor:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
    borderColor: "border-purple-200/60 dark:border-purple-500/20",
    bgColor: "bg-purple-50/50 dark:bg-purple-500/5",
  },
  application_missing: {
    label: "Apply to Context",
    icon: AppWindow,
    accentColor: "text-blue-500",
    badgeColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    borderColor: "border-blue-200/60 dark:border-blue-500/20",
    bgColor: "bg-blue-50/50 dark:bg-blue-500/5",
  },
  structure_drift: {
    label: "Structure",
    icon: Compass,
    accentColor: "text-amber-500",
    badgeColor:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    borderColor: "border-amber-200/60 dark:border-amber-500/20",
    bgColor: "bg-amber-50/50 dark:bg-amber-500/5",
  },
  evidence_lacking: {
    label: "Evidence",
    icon: BookOpen,
    accentColor: "text-red-500",
    badgeColor:
      "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    borderColor: "border-red-200/60 dark:border-red-500/20",
    bgColor: "bg-red-50/50 dark:bg-red-500/5",
  },
  time_priority: {
    label: "Time Priority",
    icon: Timer,
    accentColor: "text-orange-500",
    badgeColor:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    borderColor: "border-orange-200/60 dark:border-orange-500/20",
    bgColor: "bg-orange-50/50 dark:bg-orange-500/5",
  },
};

function persistResponse(interventionId: string, studentResponse: string) {
  fetch("/api/intervene", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interventionId, studentResponse }),
  }).catch((err) => console.error("Failed to persist response:", err));
}

export function NudgePanel({
  nudges,
  onDismiss,
  onResponseChange,
}: NudgePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(nudges.length);
  const readTimersRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  // Scroll to top when new nudge arrives (nudges are prepended)
  useEffect(() => {
    if (nudges.length > prevCountRef.current && panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevCountRef.current = nudges.length;
  }, [nudges.length]);

  // Auto-mark pending nudges as "read" after 2 seconds of visibility
  useEffect(() => {
    if (!onResponseChange) return;

    const pendingNudges = nudges.filter(
      (n) => n.student_response === "pending"
    );
    for (const nudge of pendingNudges) {
      if (!readTimersRef.current.has(nudge.id)) {
        const timer = setTimeout(() => {
          persistResponse(nudge.id, "read");
          onResponseChange(nudge.id, "read");
          readTimersRef.current.delete(nudge.id);
        }, 2000);
        readTimersRef.current.set(nudge.id, timer);
      }
    }

    return () => {
      // Cleanup timers for nudges that disappeared
      for (const [id, timer] of readTimersRef.current.entries()) {
        if (!nudges.find((n) => n.id === id)) {
          clearTimeout(timer);
          readTimersRef.current.delete(id);
        }
      }
    };
  }, [nudges, onResponseChange]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of readTimersRef.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handleRevised = useCallback(
    (nudgeId: string) => {
      persistResponse(nudgeId, "revised");
      onResponseChange?.(nudgeId, "revised");
    },
    [onResponseChange]
  );

  const activeNudges = nudges.filter(
    (n) => n.student_response !== "dismissed"
  );
  const dismissedNudges = nudges.filter(
    (n) => n.student_response === "dismissed"
  );

  return (
    <div ref={panelRef} className="w-80 border-l border-border flex-1 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">AI Coach</h2>
        {activeNudges.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-[0.6rem] px-1.5 py-0">
            {activeNudges.length}
          </Badge>
        )}
      </div>

      {nudges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <MessageSquare className="size-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground/60">
            No feedback yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Feedback will appear here as you write.
          </p>
        </div>
      ) : (
        <div className="p-4 pt-2 space-y-3">
          {/* Active nudges */}
          {activeNudges.map((nudge, index) => {
            const config = TYPE_CONFIG[nudge.intervention_type];
            const isNew = index === 0 && nudges[0]?.id === nudge.id;
            const isRead =
              nudge.student_response === "read" ||
              nudge.student_response === "revised";
            const Icon = config.icon;

            return (
              <div
                key={nudge.id}
                className={cn(
                  "rounded-xl border p-4 text-sm transition-all duration-300",
                  "shadow-sm hover:shadow-md",
                  config.borderColor,
                  config.bgColor,
                  isNew &&
                    "animate-in slide-in-from-right-5 fade-in-0 duration-500"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn("mt-0.5 shrink-0", config.accentColor)}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                          config.badgeColor
                        )}
                      >
                        {config.label}
                      </span>
                      <button
                        onClick={() => {
                          persistResponse(nudge.id, "dismissed");
                          onDismiss(nudge.id);
                        }}
                        className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Dismiss nudge"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-foreground/80">
                      {nudge.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[0.6875rem] text-muted-foreground">
                        Paragraph {nudge.paragraph_index + 1}
                      </span>
                      {nudge.student_response === "revised" ? (
                        <span className="text-xs text-emerald-600 font-medium">
                          Revised
                        </span>
                      ) : isRead && onResponseChange ? (
                        <button
                          onClick={() => handleRevised(nudge.id)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
                        >
                          Mark as revised
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dismissed nudges */}
          {dismissedNudges.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                {dismissedNudges.length} dismissed{" "}
                {dismissedNudges.length === 1 ? "nudge" : "nudges"}
              </summary>
              <div className="mt-2 space-y-2">
                {dismissedNudges.map((nudge) => {
                  const config = TYPE_CONFIG[nudge.intervention_type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={nudge.id}
                      className="rounded-xl border border-border bg-muted/30 p-3 text-sm opacity-60"
                    >
                      <div className="flex items-start gap-2">
                        <Icon
                          className={cn(
                            "size-3.5 mt-0.5 shrink-0",
                            config.accentColor
                          )}
                        />
                        <div>
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[0.6rem] font-medium",
                              config.badgeColor
                            )}
                          >
                            {config.label}
                          </span>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {nudge.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
