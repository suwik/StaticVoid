import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, MessageSquare, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavHeader } from "@/components/layout/nav-header";
import { GridBackground } from "@/components/layout/grid-background";
import { DemoScenarios } from "@/components/session/demo-scenarios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Session, SessionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatTimeLimit(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${Math.round(seconds / 60)}m`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncateQuestion(question: string, maxLength = 120): string {
  if (question.length <= maxLength) return question;
  return question.slice(0, maxLength).trimEnd() + "...";
}

const statusColors: Record<SessionStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-[var(--warm-blue)]/30 text-[#4a8099] border-[var(--warm-blue)]/40",
  abandoned: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<SessionStatus, string> = {
  active: "Active",
  completed: "Completed",
  abandoned: "Abandoned",
};

function SessionCard({
  session,
  interventionCount,
}: {
  session: Session;
  interventionCount: number;
}) {
  const href =
    session.status === "completed"
      ? `/session/${session.id}/stats`
      : `/session/${session.id}`;

  return (
    <Link href={href} className="group">
      <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:shadow-foreground/5 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-snug text-foreground group-hover:underline underline-offset-2">
            {truncateQuestion(session.question)}
          </p>
          <Badge variant="outline" className={statusColors[session.status]}>
            {statusLabels[session.status]}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{formatDate(session.created_at)}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatTimeLimit(session.time_limit)}
          </span>
          {interventionCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3" />
              {interventionCount} nudge{interventionCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-20">
      <div
        className="rounded-full p-4 mb-4"
        style={{ backgroundColor: "var(--warm-blue)" }}
      >
        <MessageSquare className="size-6 text-foreground/70" />
      </div>
      <h3 className="font-heading text-xl text-foreground">
        No sessions yet
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
        Start your first practice session to begin improving your essay writing.
      </p>
      <Link href="/session/new" className="mt-6">
        <Button className="gap-2 rounded-full px-6 h-10 font-semibold">
          <Plus className="size-4" /> Start Practicing
        </Button>
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Session[]>();

  let interventionCounts: Record<string, number> = {};
  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map((s) => s.id);
    const { data: interventions } = await supabase
      .from("interventions")
      .select("session_id")
      .in("session_id", sessionIds);

    if (interventions) {
      interventionCounts = interventions.reduce<Record<string, number>>(
        (acc, row) => {
          acc[row.session_id] = (acc[row.session_id] || 0) + 1;
          return acc;
        },
        {}
      );
    }
  }

  return (
    <GridBackground>
      <NavHeader />
      <div className="mx-auto w-full max-w-4xl p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your essay practice sessions
            </p>
          </div>
          <Link href="/session/new">
            <Button className="gap-2 rounded-full px-5 h-9 font-semibold">
              <Plus className="size-4" /> New Session
            </Button>
          </Link>
        </div>

        <DemoScenarios />

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              Failed to load sessions. Please try refreshing the page.
            </p>
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                interventionCount={interventionCounts[session.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </GridBackground>
  );
}
