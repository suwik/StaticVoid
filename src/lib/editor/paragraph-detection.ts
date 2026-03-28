import type { Descendant } from "platejs";

export interface ParagraphCheckResult {
  completedParagraphIndex: number;
  completedParagraphText: string;
  fullText: string;
}

/** Extract plain text from a single Slate node by joining its text children. */
export function extractParagraphText(node: Descendant): string {
  if ("children" in node) {
    return (node.children as Descendant[])
      .map((child) => ("text" in child ? (child as { text: string }).text : ""))
      .join("");
  }
  return "text" in node ? (node as { text: string }).text : "";
}

/** Extract full essay text from a Slate value, joining non-empty paragraphs with double newlines. */
export function extractPlainText(value: Descendant[]): string {
  return value
    .map((node) => extractParagraphText(node))
    .filter((text) => text.trim().length > 0)
    .join("\n\n");
}

/**
 * Detect when a paragraph has been completed in the Slate document.
 *
 * In Slate/Plate, pressing Enter creates a new paragraph node. A paragraph
 * is "completed" when a new empty paragraph node appears after a non-empty one.
 *
 * Returns null if no new paragraph was completed since lastCheckedCount.
 */
export function detectCompletedParagraph(
  value: Descendant[],
  lastCheckedCount: number
): ParagraphCheckResult | null {
  // Count paragraphs with actual text content
  const nonEmptyParagraphs = value.filter((node) => {
    const text = extractParagraphText(node);
    return text.trim().length > 0;
  });

  const currentNonEmptyCount = nonEmptyParagraphs.length;

  // Check if a new non-empty paragraph exists AND the last node is empty
  // (meaning the student pressed Enter to start a new paragraph)
  const lastNode = value[value.length - 1];
  const lastNodeIsEmpty =
    lastNode && extractParagraphText(lastNode).trim().length === 0;

  if (currentNonEmptyCount > lastCheckedCount && lastNodeIsEmpty) {
    const completedIndex = currentNonEmptyCount - 1;
    const completedNode = nonEmptyParagraphs[completedIndex];
    const completedText = extractParagraphText(completedNode);

    return {
      completedParagraphIndex: completedIndex,
      completedParagraphText: completedText,
      fullText: extractPlainText(value),
    };
  }

  return null;
}
