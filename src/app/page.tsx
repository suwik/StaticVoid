import Link from "next/link";
import { PenLine, ArrowRight, Sparkles, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <PenLine className="size-4 text-primary" />
          </div>
          <span className="font-heading text-xl tracking-tight">EssayCoach</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          AI-powered essay coaching
        </div>

        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-5xl font-heading tracking-tight">
            Write better essays,{" "}
            <span className="text-primary">in real time</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Practice under timed exam conditions with an AI coach that catches
            mistakes as you write — not after it&apos;s too late.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {/* Feature pillars */}
        <div className="grid grid-cols-3 gap-6 mt-8 max-w-2xl w-full">
          {[
            {
              icon: Sparkles,
              title: "Smart Nudges",
              desc: "Guiding questions, not answers",
            },
            {
              icon: Clock,
              title: "Timed Practice",
              desc: "Exam conditions, real pressure",
            },
            {
              icon: Target,
              title: "Mark Scheme Aware",
              desc: "Feedback aligned to criteria",
            },
          ].map((f) => (
            <div key={f.title} className="text-center space-y-2">
              <div className="mx-auto size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
