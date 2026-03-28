import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NudgePanel } from "@/components/editor/nudge-panel";
import type { Intervention } from "@/lib/types";

describe("NudgePanel", () => {
  const defaultProps = {
    nudges: [] as Intervention[],
    onDismiss: vi.fn(),
  };

  it("should render empty state when no nudges", () => {
    render(<NudgePanel {...defaultProps} />);
    expect(screen.getByText("AI Coach")).toBeInTheDocument();
    expect(
      screen.getByText("Feedback will appear here as you write.")
    ).toBeInTheDocument();
  });

  it("should render nudges when provided", () => {
    const nudges: Intervention[] = [
      {
        id: "nudge-1",
        session_id: "test-session",
        paragraph_index: 0,
        paragraph_text: "Test paragraph",
        intervention_type: "evaluation_depth",
        message: "What does this mean for the business?",
        student_response: "pending",
        created_at: new Date().toISOString(),
      },
    ];

    render(<NudgePanel {...defaultProps} nudges={nudges} />);
    expect(
      screen.getByText("What does this mean for the business?")
    ).toBeInTheDocument();
    expect(screen.getByText("Evaluation Depth")).toBeInTheDocument();
  });

  it("should have correct sidebar styling", () => {
    const { container } = render(<NudgePanel {...defaultProps} />);
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain("w-80");
    expect(panel.className).toContain("border-l");
  });
});
