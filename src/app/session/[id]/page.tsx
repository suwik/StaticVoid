"use client";

import { EssayEditor } from "@/components/editor/essay-editor";
import { Timer } from "@/components/editor/timer";
import { NudgePanel } from "@/components/editor/nudge-panel";
import { useNudgeState } from "@/components/editor/hooks/use-nudge-state";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const { activeNudges, addNudge, dismissNudge } = useNudgeState();
  const [timeRemaining, setTimeRemaining] = useState(45 * 60);

  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1 flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Essay Session</h1>
          <Timer sessionId={params.id} onTick={setTimeRemaining} />
        </div>
        <EssayEditor
          sessionId={params.id}
          onNudgeReceived={addNudge}
          timeRemaining={timeRemaining}
        />
      </div>
      <NudgePanel nudges={activeNudges} onDismiss={dismissNudge} />
    </div>
  );
}
