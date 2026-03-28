"use client";

import { EssayEditor } from "@/components/editor/essay-editor";
import { Timer } from "@/components/editor/timer";
import { NudgePanel } from "@/components/editor/nudge-panel";
import { useParams } from "next/navigation";

export default function SessionPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1 flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Essay Session</h1>
          <Timer sessionId={params.id} />
        </div>
        <EssayEditor sessionId={params.id} />
      </div>
      <NudgePanel sessionId={params.id} />
    </div>
  );
}
