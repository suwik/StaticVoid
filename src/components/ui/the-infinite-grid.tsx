"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from "framer-motion";

interface InfiniteGridProps {
  className?: string;
  /** Grid cell size in px */
  cellSize?: number;
  /** Background opacity of the always-visible grid (0–1) */
  baseOpacity?: number;
  /** Opacity of the mouse-reveal layer (0–1) */
  revealOpacity?: number;
  /** Radius of the mouse reveal spotlight in px */
  revealRadius?: number;
  /** Scroll speed in px/frame */
  speedX?: number;
  speedY?: number;
  /** Show colored glow blobs */
  showGlow?: boolean;
  children?: React.ReactNode;
}

export function InfiniteGrid({
  className,
  cellSize = 40,
  baseOpacity = 0.08,
  revealOpacity = 0.45,
  revealRadius = 450,
  speedX = 0.4,
  speedY = 0.4,
  showGlow = true,
  children,
}: InfiniteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speedX) % cellSize);
    gridOffsetY.set((gridOffsetY.get() + speedY) % cellSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(${revealRadius}px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  const patternId = React.useId();
  const baseId = `grid-base-${patternId}`;
  const revealId = `grid-reveal-${patternId}`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Base grid — always visible, very faint */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ opacity: baseOpacity }}
      >
        <GridPattern
          id={baseId}
          cellSize={cellSize}
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
        />
      </div>

      {/* Reveal grid — follows mouse */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity: revealOpacity,
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
        <GridPattern
          id={revealId}
          cellSize={cellSize}
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
        />
      </motion.div>

      {/* Glow blobs */}
      {showGlow && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-[var(--warm-orange)]/20 blur-[120px]" />
          <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-[var(--warm-blue)]/20 blur-[120px]" />
        </div>
      )}

      {/* Content passes through on top */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function GridPattern({
  id,
  cellSize,
  offsetX,
  offsetY,
}: {
  id: string;
  cellSize: number;
  offsetX: ReturnType<typeof useMotionValue<number>>;
  offsetY: ReturnType<typeof useMotionValue<number>>;
}) {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={id}
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
