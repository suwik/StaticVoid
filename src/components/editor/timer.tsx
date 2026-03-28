"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  sessionId: string;
}

export function Timer({ sessionId: _sessionId }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(45 * 60); // TODO: fetch from session

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLow = secondsLeft < 300; // under 5 minutes

  return (
    <div
      className={`font-mono text-lg font-semibold tabular-nums ${
        isLow ? "text-red-500" : "text-zinc-600 dark:text-zinc-400"
      }`}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
