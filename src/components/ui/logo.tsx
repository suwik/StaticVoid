import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** sm = nav/header, lg = hero/login */
  size?: "sm" | "lg";
}

export function Logo({ className, size = "sm" }: LogoProps) {
  return (
    <span
      className={cn(
        "font-logo lowercase tracking-tight select-none",
        size === "sm" && "text-[1.4rem]",
        size === "lg" && "text-[2rem]",
        className
      )}
    >
      sooner
    </span>
  );
}
