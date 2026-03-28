"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  sessionId: string;
  onTick?: (secondsLeft: number) => void;
}

export function Timer({ sessionId: _sessionId, onTick }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        const next = prev - 1;
        onTick?.(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTick]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLow = secondsLeft < 300;

  return (
    <div
      className={`font-mono text-lg font-semibold tabular-nums ${
        isLow ? "text-red-500" : "text-muted-foreground"
      }`}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
