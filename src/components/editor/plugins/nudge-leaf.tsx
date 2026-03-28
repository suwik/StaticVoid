"use client";

import type { InterventionType } from "@/lib/types";

const colorMap: Record<InterventionType, string> = {
  evaluation_depth:
    "bg-amber-100 border-b-2 border-amber-400 dark:bg-amber-900/30 dark:border-amber-500",
  application_missing:
    "bg-blue-100 border-b-2 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500",
  structure_drift:
    "bg-purple-100 border-b-2 border-purple-400 dark:bg-purple-900/30 dark:border-purple-500",
  evidence_lacking:
    "bg-red-100 border-b-2 border-red-400 dark:bg-red-900/30 dark:border-red-500",
  time_priority:
    "bg-orange-100 border-b-2 border-orange-400 dark:bg-orange-900/30 dark:border-orange-500",
};

interface NudgeLeafProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  leaf: {
    nudgeMark?: boolean;
    nudgeType?: InterventionType;
    nudgeMessage?: string;
    text: string;
  };
}

export function NudgeLeaf({ attributes, children, leaf }: NudgeLeafProps) {
  if (!leaf.nudgeMark || !leaf.nudgeType) {
    return <span {...attributes}>{children}</span>;
  }

  const classes = colorMap[leaf.nudgeType] ?? "bg-amber-100";

  return (
    <span
      {...attributes}
      className={`${classes} rounded-sm cursor-pointer transition-colors`}
      title={leaf.nudgeMessage}
    >
      {children}
    </span>
  );
}
