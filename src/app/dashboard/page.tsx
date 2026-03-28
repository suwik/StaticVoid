import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

const statusConfig: Record<
  SessionStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  completed: {
    label: "Completed",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  abandoned: {
    label: "Abandoned",
    className:
      "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

function StatusBadge({ status }: { status: SessionStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

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
    <Link
      href={href}
      className="group block rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-foreground group-hover:underline">
          {truncateQuestion(session.question)}
        </p>
        <StatusBadge status={session.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{formatDate(session.created_at)}</span>
        <span className="flex items-center gap-1">
          <ClockIcon />
          {formatTimeLimit(session.time_limit)}
        </span>
        {interventionCount > 0 && (
          <span className="flex items-center gap-1">
            <NudgeIcon />
            {interventionCount} nudge{interventionCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="size-3"
    >
      <path
        fillRule="evenodd"
        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5c0 .199.079.39.22.53l2 2a.75.75 0 1 0 1.06-1.06L8.75 7.94V4.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function NudgeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="size-3"
    >
      <path
        fillRule="evenodd"
        d="M1 8.74c0 .983.713 1.825 1.69 1.943.904.108 1.817.19 2.737.243.363.02.688.231.85.556l1.052 2.103a.75.75 0 0 0 1.342 0l1.052-2.103c.162-.325.487-.535.85-.556.92-.053 1.833-.134 2.738-.243C14.287 10.565 15 9.723 15 8.74V4.26c0-.983-.713-1.825-1.69-1.943a44.89 44.89 0 0 0-10.62 0C1.713 2.435 1 3.277 1 4.26v4.482ZM5.5 6a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
      <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6 text-zinc-400"
        >
          <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" />
          <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">
        No sessions yet
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        Start your first practice session to begin improving your essay writing.
      </p>
      <Link
        href="/session/new"
        className="mt-6 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
      >
        Start Practicing
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

  // Fetch intervention counts for all sessions in a single query
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
    <div className="mx-auto w-full max-w-4xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your essay practice sessions
          </p>
        </div>
        <Link
          href="/session/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          New Session
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load sessions. Please try refreshing the page.
          </p>
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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
  );
}
