import { createPlatePlugin } from "platejs/react";
import { NodeApi } from "platejs";
import type { ClientNudge, InterventionResponse } from "@/lib/types";

export const ParagraphDetectionPlugin = createPlatePlugin({
  key: "paragraphDetection",
  options: {
    lastCheckedCount: 0,
    sessionId: "" as string,
    timeRemaining: 0 as number,
    onNudgeReceived: ((_nudge: ClientNudge) => {}) as (
      nudge: ClientNudge
    ) => void,
  },
  handlers: {
    onChange: ({ editor, getOption, setOption }) => {
      const paragraphs = editor.children.filter(
        (node) =>
          "type" in node &&
          node.type === "p" &&
          NodeApi.string(node).trim().length > 0
      );
      const currentCount = paragraphs.length;
      const lastChecked = getOption("lastCheckedCount");

      if (currentCount > lastChecked && currentCount >= 2) {
        const completedIndex = currentCount - 2;
        setOption("lastCheckedCount", currentCount - 1);

        const completedText = NodeApi.string(paragraphs[completedIndex]);
        const essaySoFar = editor.children
          .map((node) => NodeApi.string(node))
          .filter((t) => t.trim())
          .join("\n\n");

        const sessionId = getOption("sessionId");
        const timeRemaining = getOption("timeRemaining");
        const onNudgeReceived = getOption("onNudgeReceived");

        fetch("/api/intervene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            essaySoFar,
            latestParagraph: completedText,
            paragraphIndex: completedIndex,
            timeRemaining,
          }),
        })
          .then((res) => res.json())
          .then((response: InterventionResponse) => {
            if (
              response.should_intervene &&
              response.type &&
              response.message
            ) {
              onNudgeReceived({
                id: crypto.randomUUID(),
                paragraphIndex: completedIndex,
                interventionType: response.type,
                message: response.message,
                timestamp: new Date(),
                dismissed: false,
              });
            }
          })
          .catch(console.error);
      }
    },
  },
});
