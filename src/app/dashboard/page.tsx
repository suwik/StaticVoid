import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/session/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          New Session
        </Link>
      </div>
      <div className="text-zinc-500">
        <p>Your practice sessions will appear here.</p>
      </div>
    </div>
  );
}
