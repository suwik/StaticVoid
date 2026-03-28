import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EssayEditor } from "@/components/editor/essay-editor";

const defaultProps = {
  sessionId: "test-id",
  onNudgeReceived: vi.fn(),
  timeRemaining: 2700,
};

describe("EssayEditor (Plate)", () => {
  it("should render a contenteditable editor", () => {
    const { container } = render(<EssayEditor {...defaultProps} />);
    const editable = container.querySelector('[contenteditable="true"]');
    expect(editable).toBeInTheDocument();
  });

  it("should render the editor container", () => {
    const { container } = render(<EssayEditor {...defaultProps} />);
    const editorEl = container.querySelector('[data-slate-editor="true"]');
    expect(editorEl).toBeInTheDocument();
    expect(editorEl?.getAttribute("role")).toBe("textbox");
  });
});
