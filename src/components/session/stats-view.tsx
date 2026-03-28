interface StatsViewProps {
  sessionId: string;
}

export function StatsView({ sessionId: _sessionId }: StatsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Nudges Received</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Self-corrections</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Time Used</p>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="font-semibold mb-2">Skill Breakdown</h3>
        <p className="text-sm text-zinc-500">
          Detailed intervention breakdown will appear here after completing a session.
        </p>
      </div>
    </div>
  );
}
