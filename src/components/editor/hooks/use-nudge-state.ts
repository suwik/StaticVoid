"use client";

import { useState, useCallback } from "react";
import type { ClientNudge } from "@/lib/types";

export function useNudgeState() {
  const [nudges, setNudges] = useState<ClientNudge[]>([]);

  const addNudge = useCallback((nudge: ClientNudge) => {
    setNudges((prev) => [...prev, nudge]);
  }, []);

  const dismissNudge = useCallback((nudgeId: string) => {
    setNudges((prev) =>
      prev.map((n) => (n.id === nudgeId ? { ...n, dismissed: true } : n))
    );
  }, []);

  const activeNudges = nudges.filter((n) => !n.dismissed);

  return { nudges, activeNudges, addNudge, dismissNudge };
}
