"use client";

import { useState } from "react";
import type { Intervention } from "@/lib/types";

interface NudgePanelProps {
  sessionId: string;
}

export function NudgePanel({ sessionId: _sessionId }: NudgePanelProps) {
  const [nudges] = useState<Intervention[]>([]);

  if (nudges.length === 0) {
    return (
      <div className="w-80 border-l border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-500">AI Coach</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Feedback will appear here as you write.
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-zinc-200 p-4 space-y-3 overflow-y-auto dark:border-zinc-800">
      <h2 className="text-sm font-semibold text-zinc-500">AI Coach</h2>
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950"
        >
          <p className="text-amber-800 dark:text-amber-200">{nudge.message}</p>
          <span className="mt-1 inline-block text-xs text-amber-500">
            {nudge.intervention_type.replace(/_/g, " ")}
          </span>
        </div>
      ))}
    </div>
  );
}
