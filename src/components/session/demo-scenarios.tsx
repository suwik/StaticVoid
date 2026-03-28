"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Clock, AlertTriangle, PenOff, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";
import type { DemoScenario } from "@/lib/demo-scenarios";

const SCENARIO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "one-minute-no-conclusion": Clock,
  "four-minutes-no-evaluation": AlertTriangle,
  "stuck-clock-running": PenOff,
  "describing-not-analyzing": BookOpen,
};

const SCENARIO_COLORS: Record<string, string> = {
  "one-minute-no-conclusion": "var(--warm-orange)",
  "four-minutes-no-evaluation": "var(--warm-lavender)",
  "stuck-clock-running": "#d97070",
  "describing-not-analyzing": "var(--warm-blue)",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function DemoCard({ scenario }: { scenario: DemoScenario }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const Icon = SCENARIO_ICONS[scenario.id] ?? Play;
  const color = SCENARIO_COLORS[scenario.id] ?? "var(--warm-blue)";

  async function launch() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id }),
      });
      if (res.ok) {
        const { sessionId } = await res.json();
        router.push(`/session/${sessionId}`);
      } else {
        console.error("Failed to launch demo:", await res.text());
        setLoading(false);
      }
    } catch (err) {
      console.error("Demo launch error:", err);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={launch}
      disabled={loading}
      className={cn(
        "group text-left rounded-2xl border p-5 transition-all",
        "hover:shadow-md hover:shadow-foreground/5 hover:-translate-y-0.5",
        "disabled:opacity-70 disabled:cursor-wait"
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 8%, var(--card))`,
        borderColor: `color-mix(in srgb, ${color} 20%, var(--border))`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 mt-0.5 rounded-full p-2"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 25%, transparent)` }}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin opacity-70" />
          ) : (
            <Icon className="size-4 opacity-70" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {scenario.title}
            </h3>
            <span
              className="shrink-0 text-[0.65rem] font-mono font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                color: `color-mix(in srgb, ${color} 80%, var(--foreground))`,
              }}
            >
              {formatTime(scenario.timeRemaining)} left
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {scenario.subtitle}
          </p>
        </div>
        <Play
          className={cn(
            "size-4 shrink-0 mt-1 text-muted-foreground/40 transition-all",
            "group-hover:text-foreground/60 group-hover:translate-x-0.5"
          )}
        />
      </div>
    </button>
  );
}

export function DemoScenarios() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg tracking-tight">
          Demo Scenarios
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pre-built sessions that showcase AI coaching in action. Click to launch.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_SCENARIOS.map((scenario) => (
          <DemoCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
