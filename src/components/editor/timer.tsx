"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  timeLimit: number; // in seconds (full session duration, used for progress ring)
  initialSeconds?: number; // actual seconds to count down from (accounts for elapsed time)
  onTimeUpdate: (secondsLeft: number) => void;
  onTimerExpired: () => void;
  disabled?: boolean;
}

export function Timer({
  timeLimit,
  initialSeconds,
  onTimeUpdate,
  onTimerExpired,
  disabled = false,
}: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds ?? timeLimit);
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

  // Circular progress
  const progress = timeLimit > 0 ? secondsLeft / timeLimit : 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  let ringColor = "stroke-primary";
  let textColor = "text-foreground";
  if (isCritical) {
    ringColor = "stroke-destructive";
    textColor = "text-destructive";
  } else if (isWarning) {
    ringColor = "stroke-amber-500";
    textColor = "text-amber-500";
  }

  return (
    <div className="flex items-center gap-3">
      {/* Circular progress ring */}
      <div className="relative size-11 shrink-0">
        <svg className="size-11 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            className={cn(ringColor, "transition-all duration-1000")}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isCritical ? (
            <AlertTriangle className="size-3.5 text-destructive" />
          ) : (
            <Clock className={cn("size-3.5", textColor)} />
          )}
        </div>
      </div>

      {/* Time text */}
      <div
        className={cn(
          "font-mono text-2xl font-bold tabular-nums tracking-tight",
          textColor,
          isCritical && "animate-pulse"
        )}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
    </div>
  );
}
