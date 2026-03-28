"use client";

import { useState, useEffect, useRef } from "react";

interface TimerProps {
  timeLimit: number; // in seconds
  onTimeUpdate: (secondsLeft: number) => void;
  onTimerExpired: () => void;
  disabled?: boolean;
}

export function Timer({
  timeLimit,
  onTimeUpdate,
  onTimerExpired,
  disabled = false,
}: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            // Fire expired callback on next tick to avoid setState-during-render
            setTimeout(() => onTimerExpired(), 0);
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disabled, onTimerExpired]);

  // Report time changes to parent
  useEffect(() => {
    onTimeUpdate(secondsLeft);
  }, [secondsLeft, onTimeUpdate]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const isWarning = secondsLeft < 600 && secondsLeft >= 300; // 5-10 min
  const isCritical = secondsLeft < 300; // under 5 min

  let colorClass = "text-zinc-600 dark:text-zinc-400";
  if (isCritical) {
    colorClass = "text-red-500";
  } else if (isWarning) {
    colorClass = "text-amber-500";
  }

  return (
    <div
      className={`font-mono text-lg font-semibold tabular-nums ${colorClass} ${
        isCritical ? "animate-pulse" : ""
      }`}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
