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
 * A paragraph is "completed" when:
 * 1. The last node in the document is empty (student pressed Enter)
 * 2. The node before it has text content
 * 3. That text hasn't been checked yet (not in checkedTexts set)
 *
 * Uses a Set of checked paragraph texts instead of a simple counter,
 * making it robust across page reloads and out-of-order edits.
 */
export function detectCompletedParagraph(
  value: Descendant[],
  checkedTexts: Set<string>
): ParagraphCheckResult | null {
  if (value.length < 2) return null;

  // Last node must be empty (student pressed Enter to start a new paragraph)
  const lastNode = value[value.length - 1];
  const lastNodeIsEmpty =
    lastNode && extractParagraphText(lastNode).trim().length === 0;

  if (!lastNodeIsEmpty) return null;

  // The completed paragraph is the last non-empty node before the empty one
  const completedNode = value[value.length - 2];
  const completedText = extractParagraphText(completedNode).trim();

  if (!completedText) return null;

  // Skip if we've already checked this exact paragraph text
  if (checkedTexts.has(completedText)) return null;

  // Find the index among non-empty paragraphs
  const nonEmptyParagraphs = value.filter(
    (node) => extractParagraphText(node).trim().length > 0
  );
  const completedIndex = nonEmptyParagraphs.length - 1;

  return {
    completedParagraphIndex: completedIndex,
    completedParagraphText: completedText,
    fullText: extractPlainText(value),
  };
}
