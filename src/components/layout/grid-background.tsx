"use client";

import { InfiniteGrid } from "@/components/ui/the-infinite-grid";

/**
 * Subtle grid background for inner pages.
 * Wraps content without interfering — very faint base grid, gentle mouse reveal.
 */
export function GridBackground({ children }: { children: React.ReactNode }) {
  return (
    <InfiniteGrid
      className="flex flex-1 flex-col min-h-screen"
      baseOpacity={0.05}
      revealOpacity={0.25}
      revealRadius={380}
      speedX={0.15}
      speedY={0.15}
      showGlow={false}
    >
      {children}
    </InfiniteGrid>
  );
}
