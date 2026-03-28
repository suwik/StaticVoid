import { StatsView } from "@/components/session/stats-view";
import { NavHeader } from "@/components/layout/nav-header";
import { GridBackground } from "@/components/layout/grid-background";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <GridBackground>
      <NavHeader />
      <div className="mx-auto w-full max-w-3xl p-8 space-y-6">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Session Results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your performance and coaching feedback
          </p>
        </div>
        <StatsView sessionId={id} />
      </div>
    </GridBackground>
  );
}
