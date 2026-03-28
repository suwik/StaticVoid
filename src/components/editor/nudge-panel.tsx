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
    color: string;
    badgeClass: string;
  }
> = {
  evaluation_depth: {
    label: "Evaluation Depth",
    icon: Search,
    color: "var(--warm-lavender)",
    badgeClass: "bg-[var(--warm-lavender)]/30 text-[#7a5a8a] border-[var(--warm-lavender)]/40",
  },
  application_missing: {
    label: "Apply to Context",
    icon: AppWindow,
    color: "var(--warm-blue)",
    badgeClass: "bg-[var(--warm-blue)]/30 text-[#4a7a8a] border-[var(--warm-blue)]/40",
  },
  structure_drift: {
    label: "Structure",
    icon: Compass,
    color: "var(--warm-orange)",
    badgeClass: "bg-[var(--warm-orange)]/30 text-[#8a6a3a] border-[var(--warm-orange)]/40",
  },
  evidence_lacking: {
    label: "Evidence",
    icon: BookOpen,
    color: "#d97070",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  time_priority: {
    label: "Time Priority",
    icon: Timer,
    color: "var(--warm-orange)",
    badgeClass: "bg-[var(--warm-orange)]/30 text-[#8a6a3a] border-[var(--warm-orange)]/40",
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

  useEffect(() => {
    if (nudges.length > prevCountRef.current && panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevCountRef.current = nudges.length;
  }, [nudges.length]);

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
      for (const [id, timer] of readTimersRef.current.entries()) {
        if (!nudges.find((n) => n.id === id)) {
          clearTimeout(timer);
          readTimersRef.current.delete(id);
        }
      }
    };
  }, [nudges, onResponseChange]);

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
        <Sparkles className="size-4 text-foreground/60" />
        <h2 className="text-sm font-semibold text-foreground">AI Coach</h2>
        {activeNudges.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-[0.6rem] px-1.5 py-0 rounded-full">
            {activeNudges.length}
          </Badge>
        )}
      </div>

      {nudges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div
            className="rounded-full p-3 mb-3"
            style={{ backgroundColor: "var(--warm-blue)", opacity: 0.4 }}
          >
            <MessageSquare className="size-5 text-foreground/70" />
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
                  "rounded-2xl border p-4 text-sm transition-all duration-300",
                  "hover:shadow-sm",
                  isNew &&
                    "animate-in slide-in-from-right-5 fade-in-0 duration-500"
                )}
                style={{
                  backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
                  borderColor: `color-mix(in srgb, ${config.color} 25%, transparent)`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 opacity-70">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={cn("text-[0.65rem] rounded-full", config.badgeClass)}>
                        {config.label}
                      </Badge>
                      <button
                        onClick={() => {
                          persistResponse(nudge.id, "dismissed");
                          onDismiss(nudge.id);
                        }}
                        className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                      className="rounded-2xl border border-border bg-muted/30 p-3 text-sm opacity-60"
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="size-3.5 mt-0.5 shrink-0 opacity-60" />
                        <div>
                          <Badge variant="outline" className={cn("text-[0.6rem] rounded-full", config.badgeClass)}>
                            {config.label}
                          </Badge>
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
