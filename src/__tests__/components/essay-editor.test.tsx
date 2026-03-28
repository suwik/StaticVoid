import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EssayEditor } from "@/components/editor/essay-editor";

// Mock fetch globally
global.fetch = vi.fn();

describe("EssayEditor", () => {
  const defaultProps = {
    sessionId: "test-id",
    timeRemaining: 2700,
    onContentChange: vi.fn(),
    onNewNudge: vi.fn(),
  };

  it("should render the Plate editor", () => {
    render(<EssayEditor {...defaultProps} />);
    const editor = screen.getByRole("textbox");
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute("data-slate-editor", "true");
    expect(editor).toHaveAttribute("contenteditable", "true");
  });

  it("should render the word count", () => {
    render(<EssayEditor {...defaultProps} />);
    expect(screen.getByText(/0\s*words/)).toBeInTheDocument();
  });

  it("should render as read-only when disabled", () => {
    const { container } = render(<EssayEditor {...defaultProps} disabled />);
    const editor = container.querySelector("[data-slate-editor]");
    expect(editor).not.toBeNull();
    expect(editor).toHaveAttribute("contenteditable", "false");
  });
});
