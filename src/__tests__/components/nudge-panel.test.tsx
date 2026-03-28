import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NudgePanel } from "@/components/editor/nudge-panel";
import type { Intervention } from "@/lib/types";

function makeNudge(overrides: Partial<Intervention> = {}): Intervention {
  return {
    id: "nudge-1",
    session_id: "test-session",
    paragraph_index: 0,
    paragraph_text: "Test paragraph",
    intervention_type: "evaluation_depth",
    message: "What does this mean for the business?",
    student_response: "pending",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("NudgePanel", () => {
  const defaultProps = {
    nudges: [] as Intervention[],
    onDismiss: vi.fn(),
  };

  it("should render empty state when no nudges", () => {
    render(<NudgePanel {...defaultProps} />);
    expect(screen.getByText("AI Coach")).toBeInTheDocument();
    expect(screen.getByText("No feedback yet")).toBeInTheDocument();
  });

  it("should render a single nudge with correct type badge", () => {
    render(
      <NudgePanel {...defaultProps} nudges={[makeNudge()]} />
    );
    expect(
      screen.getByText("What does this mean for the business?")
    ).toBeInTheDocument();
    expect(screen.getByText("Evaluation Depth")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
  });

  it("should render all 5 intervention types with distinct badges", () => {
    const nudges: Intervention[] = [
      makeNudge({ id: "1", intervention_type: "evaluation_depth", message: "msg1" }),
      makeNudge({ id: "2", intervention_type: "application_missing", message: "msg2" }),
      makeNudge({ id: "3", intervention_type: "structure_drift", message: "msg3" }),
      makeNudge({ id: "4", intervention_type: "evidence_lacking", message: "msg4" }),
      makeNudge({ id: "5", intervention_type: "time_priority", message: "msg5" }),
    ];

    render(<NudgePanel {...defaultProps} nudges={nudges} />);
    expect(screen.getByText("Evaluation Depth")).toBeInTheDocument();
    expect(screen.getByText("Apply to Context")).toBeInTheDocument();
    expect(screen.getByText("Structure")).toBeInTheDocument();
    expect(screen.getByText("Evidence")).toBeInTheDocument();
    expect(screen.getByText("Time Priority")).toBeInTheDocument();
  });

  it("should call onDismiss when dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <NudgePanel
        nudges={[makeNudge({ id: "nudge-42" })]}
        onDismiss={onDismiss}
      />
    );

    const dismissBtn = screen.getByLabelText("Dismiss nudge");
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledWith("nudge-42");
  });

  it("should separate active and dismissed nudges", () => {
    const nudges: Intervention[] = [
      makeNudge({ id: "active-1", student_response: "pending", message: "Active nudge" }),
      makeNudge({ id: "dismissed-1", student_response: "dismissed", message: "Dismissed nudge" }),
    ];

    render(<NudgePanel {...defaultProps} nudges={nudges} />);
    expect(screen.getByText("Active nudge")).toBeInTheDocument();
    expect(screen.getByText(/1 dismissed/)).toBeInTheDocument();
  });

  it("should show multiple nudges in order", () => {
    const nudges: Intervention[] = [
      makeNudge({ id: "1", paragraph_index: 2, message: "Third paragraph issue" }),
      makeNudge({ id: "2", paragraph_index: 0, message: "First paragraph issue" }),
    ];

    render(<NudgePanel {...defaultProps} nudges={nudges} />);
    const messages = screen.getAllByText(/paragraph issue/);
    expect(messages).toHaveLength(2);
    expect(messages[0].textContent).toBe("Third paragraph issue");
  });

  it("should show paragraph reference number (1-indexed)", () => {
    render(
      <NudgePanel
        {...defaultProps}
        nudges={[makeNudge({ paragraph_index: 3 })]}
      />
    );
    expect(screen.getByText("Paragraph 4")).toBeInTheDocument();
  });

  it("should render with overflow scroll", () => {
    const { container } = render(<NudgePanel {...defaultProps} />);
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain("overflow-y-auto");
  });

  describe("response tracking", () => {
    it("should show 'Mark as revised' button for read nudges", () => {
      const onResponseChange = vi.fn();
      render(
        <NudgePanel
          {...defaultProps}
          nudges={[makeNudge({ student_response: "read" })]}
          onResponseChange={onResponseChange}
        />
      );
      expect(screen.getByText("Mark as revised")).toBeInTheDocument();
    });

    it("should call onResponseChange with 'revised' when button clicked", () => {
      const onResponseChange = vi.fn();
      render(
        <NudgePanel
          {...defaultProps}
          nudges={[makeNudge({ id: "n1", student_response: "read" })]}
          onResponseChange={onResponseChange}
        />
      );

      fireEvent.click(screen.getByText("Mark as revised"));
      expect(onResponseChange).toHaveBeenCalledWith("n1", "revised");
    });

    it("should show 'Revised' label for revised nudges", () => {
      render(
        <NudgePanel
          {...defaultProps}
          nudges={[makeNudge({ student_response: "revised" })]}
        />
      );
      expect(screen.getByText("Revised")).toBeInTheDocument();
    });

    it("should not show 'Mark as revised' for pending nudges", () => {
      render(
        <NudgePanel
          {...defaultProps}
          nudges={[makeNudge({ student_response: "pending" })]}
          onResponseChange={vi.fn()}
        />
      );
      expect(screen.queryByText("Mark as revised")).not.toBeInTheDocument();
    });
  });
});
