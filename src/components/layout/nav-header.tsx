"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between h-16 px-8 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
        <Logo />
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          href="/dashboard"
          className={`px-3.5 py-1.5 text-sm rounded-full transition-colors ${
            pathname === "/dashboard"
              ? "text-foreground bg-muted font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/session/new"
          className={`px-3.5 py-1.5 text-sm rounded-full transition-colors ${
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
