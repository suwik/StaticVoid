"use client";

import { useMemo } from "react";
import { Plate, usePlateEditor, ParagraphPlugin } from "platejs/react";
import { EditorContainer, Editor } from "@/components/ui/editor";
import { ParagraphDetectionPlugin } from "./plugins/paragraph-detection";
import { NudgeMarkPlugin } from "./plugins/nudge-mark";
import type { ClientNudge } from "@/lib/types";

interface EssayEditorProps {
  sessionId: string;
  onNudgeReceived: (nudge: ClientNudge) => void;
  timeRemaining: number;
}

export function EssayEditor({
  sessionId,
  onNudgeReceived,
  timeRemaining,
}: EssayEditorProps) {
  const plugins = useMemo(
    () => [
      ParagraphPlugin,
      NudgeMarkPlugin,
      ParagraphDetectionPlugin.configure({
        options: {
          sessionId,
          onNudgeReceived,
          timeRemaining,
        },
      }),
    ],
    [sessionId, onNudgeReceived, timeRemaining]
  );

  const editor = usePlateEditor({
    plugins,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer className="flex-1 rounded-lg border border-border">
        <Editor
          placeholder="Start writing your essay here... Press Enter to start a new paragraph."
          variant="fullWidth"
          autoFocus
        />
      </EditorContainer>
    </Plate>
  );
}
