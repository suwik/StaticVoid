"use client";

import { useState, useCallback } from "react";

interface EssayEditorProps {
  sessionId: string;
}

export function EssayEditor({ sessionId }: EssayEditorProps) {
  const [content, setContent] = useState("");
  const [lastCheckedParagraphs, setLastCheckedParagraphs] = useState(0);

  const checkForNewParagraph = useCallback(
    async (text: string) => {
      const paragraphs = text
        .split(/\n\n+/)
        .filter((p) => p.trim().length > 0);
      const currentCount = paragraphs.length;

      if (currentCount > lastCheckedParagraphs && paragraphs[currentCount - 1]?.trim()) {
        // New paragraph detected - but only check the previous one (the completed one)
        const completedIndex = currentCount - 2;
        if (completedIndex >= 0) {
          setLastCheckedParagraphs(currentCount - 1);

          try {
            await fetch("/api/intervene", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                essaySoFar: text,
                latestParagraph: paragraphs[completedIndex],
                paragraphIndex: completedIndex,
                timeRemaining: 0, // TODO: get from timer
              }),
            });
          } catch (error) {
            console.error("Failed to check paragraph:", error);
          }
        }
      }
    },
    [sessionId, lastCheckedParagraphs]
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value;
    setContent(newContent);
    checkForNewParagraph(newContent);
  }

  return (
    <textarea
      value={content}
      onChange={handleChange}
      className="flex-1 w-full resize-none rounded-lg border border-zinc-200 p-4 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-700"
      placeholder="Start writing your essay here... Press Enter twice to start a new paragraph."
      autoFocus
    />
  );
}
