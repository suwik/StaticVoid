"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine } from "lucide-react";

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <PenLine className="size-4 text-primary" />
        </div>
        <span className="font-heading text-xl tracking-tight">EssayCoach</span>
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          href="/dashboard"
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            pathname === "/dashboard"
              ? "text-foreground bg-muted font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/session/new"
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            pathname === "/session/new"
              ? "text-foreground bg-muted font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          New Session
        </Link>
      </nav>
    </header>
  );
}
