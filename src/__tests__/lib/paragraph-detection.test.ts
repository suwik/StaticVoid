import { describe, it, expect } from "vitest";
import {
  detectCompletedParagraph,
  extractPlainText,
  extractParagraphText,
} from "@/lib/editor/paragraph-detection";

describe("extractParagraphText", () => {
  it("extracts text from a paragraph node", () => {
    const node = { type: "p", children: [{ text: "Hello world" }] };
    expect(extractParagraphText(node)).toBe("Hello world");
  });

  it("joins multiple text children", () => {
    const node = {
      type: "p",
      children: [
        { text: "Hello " },
        { text: "bold", bold: true },
        { text: " world" },
      ],
    };
    expect(extractParagraphText(node)).toBe("Hello bold world");
  });

  it("returns empty string for empty paragraph", () => {
    const node = { type: "p", children: [{ text: "" }] };
    expect(extractParagraphText(node)).toBe("");
  });
});

describe("extractPlainText", () => {
  it("joins non-empty paragraphs with double newlines", () => {
    const value = [
      { type: "p", children: [{ text: "First paragraph" }] },
      { type: "p", children: [{ text: "Second paragraph" }] },
    ];
    expect(extractPlainText(value)).toBe(
      "First paragraph\n\nSecond paragraph"
    );
  });

  it("skips empty paragraphs", () => {
    const value = [
      { type: "p", children: [{ text: "First" }] },
      { type: "p", children: [{ text: "" }] },
      { type: "p", children: [{ text: "Third" }] },
    ];
    expect(extractPlainText(value)).toBe("First\n\nThird");
  });

  it("returns empty string for all-empty paragraphs", () => {
    const value = [
      { type: "p", children: [{ text: "" }] },
      { type: "p", children: [{ text: "  " }] },
    ];
    expect(extractPlainText(value)).toBe("");
  });
});

describe("detectCompletedParagraph", () => {
  it("returns null for a single empty paragraph", () => {
    const value = [{ type: "p", children: [{ text: "" }] }];
    expect(detectCompletedParagraph(value, 0)).toBeNull();
  });

  it("returns null for a single paragraph with text (no new paragraph started)", () => {
    const value = [{ type: "p", children: [{ text: "Writing here..." }] }];
    expect(detectCompletedParagraph(value, 0)).toBeNull();
  });

  it("detects completed paragraph when new empty paragraph follows", () => {
    const value = [
      { type: "p", children: [{ text: "Completed paragraph content" }] },
      { type: "p", children: [{ text: "" }] },
    ];
    const result = detectCompletedParagraph(value, 0);

    expect(result).not.toBeNull();
    expect(result!.completedParagraphIndex).toBe(0);
    expect(result!.completedParagraphText).toBe("Completed paragraph content");
    expect(result!.fullText).toBe("Completed paragraph content");
  });

  it("does not re-detect already checked paragraphs", () => {
    const value = [
      { type: "p", children: [{ text: "Completed paragraph content" }] },
      { type: "p", children: [{ text: "" }] },
    ];
    // Already checked 1 paragraph
    expect(detectCompletedParagraph(value, 1)).toBeNull();
  });

  it("detects second completed paragraph", () => {
    const value = [
      { type: "p", children: [{ text: "First paragraph" }] },
      { type: "p", children: [{ text: "Second paragraph" }] },
      { type: "p", children: [{ text: "" }] },
    ];
    // Already checked 1 paragraph
    const result = detectCompletedParagraph(value, 1);

    expect(result).not.toBeNull();
    expect(result!.completedParagraphIndex).toBe(1);
    expect(result!.completedParagraphText).toBe("Second paragraph");
    expect(result!.fullText).toBe("First paragraph\n\nSecond paragraph");
  });

  it("returns null when last node has text (still typing)", () => {
    const value = [
      { type: "p", children: [{ text: "First paragraph" }] },
      { type: "p", children: [{ text: "Still typing..." }] },
    ];
    expect(detectCompletedParagraph(value, 0)).toBeNull();
  });

  it("handles paragraphs with formatted text (marks)", () => {
    const value = [
      {
        type: "p",
        children: [
          { text: "This is " },
          { text: "bold", bold: true },
          { text: " and " },
          { text: "italic", italic: true },
          { text: " text" },
        ],
      },
      { type: "p", children: [{ text: "" }] },
    ];

    const result = detectCompletedParagraph(value, 0);
    expect(result).not.toBeNull();
    expect(result!.completedParagraphText).toBe(
      "This is bold and italic text"
    );
  });
});
