"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PredefinedScenario } from "@/lib/predefined-scenarios";

function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ScenarioCards({ scenarios }: { scenarios: PredefinedScenario[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function launchScenario(scenario: PredefinedScenario) {
    if (loadingId) return;
    setLoadingId(scenario.id);

    try {
      // Back-date started_at so the timer shows the correct time remaining
      const elapsedMs = (scenario.timeLimit - scenario.timeRemaining) * 1000;
      const startedAt = new Date(Date.now() - elapsedMs).toISOString();

      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: scenario.question,
          markScheme: scenario.markScheme,
          timeLimit: scenario.timeLimit,
          startedAt,
        }),
      });

      if (!sessionRes.ok) throw new Error("Failed to create session");
      const session = await sessionRes.json();

      // Pre-fill the essay content
      await fetch("/api/essay", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          content: scenario.essayContent,
        }),
      });

      router.push(`/session/${session.id}`);
    } catch {
      setLoadingId(null);
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-lg tracking-tight">Try a Demo Scenario</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Jump into a pre-built situation to see how Sooner coaches in real time.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {scenarios.map((scenario) => {
          const isLoading = loadingId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => launchScenario(scenario)}
              disabled={loadingId !== null}
              className="group text-left rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md hover:shadow-foreground/5 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {scenario.title}
                </p>
                <div className="shrink-0">
                  {isLoading ? (
                    <Loader2 className="size-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Play className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {scenario.situation}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1 text-[0.65rem] px-2 py-0.5 rounded-full bg-[var(--warm-blue)]/20 text-[#4a8099] border-[var(--warm-blue)]/30"
                >
                  <Clock className="size-2.5" />
                  {formatTimeRemaining(scenario.timeRemaining)} left
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
