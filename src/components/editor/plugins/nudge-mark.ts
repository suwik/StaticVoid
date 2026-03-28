import { createPlatePlugin, type PlateEditor } from "platejs/react";
import { NodeApi } from "platejs";
import type { InterventionType } from "@/lib/types";
import { NudgeLeaf } from "./nudge-leaf";

export const NUDGE_MARK_KEY = "nudgeMark";

export const NudgeMarkPlugin = createPlatePlugin({
  key: NUDGE_MARK_KEY,
  node: {
    isLeaf: true,
    component: NudgeLeaf,
  },
});

export function applyNudgeMark(
  editor: PlateEditor,
  paragraphIndex: number,
  interventionType: InterventionType,
  message: string
) {
  const paragraphs = editor.children.filter(
    (node) =>
      "type" in node &&
      node.type === "p" &&
      NodeApi.string(node).trim().length > 0
  );

  const targetNode = paragraphs[paragraphIndex];
  if (!targetNode) return;

  const savedSelection = editor.selection;

  try {
    const path = editor.api.findPath(targetNode);
    if (!path) return;

    const range = editor.api.range(path);
    if (!range) return;

    editor.tf.select(range);
    editor.tf.addMark(NUDGE_MARK_KEY, true);
    editor.tf.addMark("nudgeType", interventionType);
    editor.tf.addMark("nudgeMessage", message);
  } finally {
    if (savedSelection) {
      editor.tf.select(savedSelection);
    }
  }
}
