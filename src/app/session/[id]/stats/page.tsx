import { StatsView } from "@/components/session/stats-view";
import { NavHeader } from "@/components/layout/nav-header";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <NavHeader />
      <div className="mx-auto w-full max-w-3xl p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Session Results</h1>
        <StatsView sessionId={id} />
      </div>
    </>
  );
}
