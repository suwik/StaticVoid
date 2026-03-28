import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NudgePanel } from "@/components/editor/nudge-panel";
import type { ClientNudge } from "@/lib/types";

const mockDismiss = vi.fn();

describe("NudgePanel", () => {
  it("should render empty state when no nudges", () => {
    render(<NudgePanel nudges={[]} onDismiss={mockDismiss} />);
    expect(screen.getByText("AI Coach")).toBeInTheDocument();
    expect(
      screen.getByText("Feedback will appear here as you write.")
    ).toBeInTheDocument();
  });

  it("should have correct width styling", () => {
    const { container } = render(
      <NudgePanel nudges={[]} onDismiss={mockDismiss} />
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain("w-80");
    expect(panel.className).toContain("border-l");
  });

  it("should render nudge cards when nudges are provided", () => {
    const nudges: ClientNudge[] = [
      {
        id: "1",
        paragraphIndex: 0,
        interventionType: "evaluation_depth",
        message: "What does this mean for the business long-term?",
        timestamp: new Date(),
        dismissed: false,
      },
    ];
    render(<NudgePanel nudges={nudges} onDismiss={mockDismiss} />);
    expect(
      screen.getByText("What does this mean for the business long-term?")
    ).toBeInTheDocument();
    expect(screen.getByText("Evaluation depth")).toBeInTheDocument();
  });

  it("should call onDismiss when dismiss button is clicked", () => {
    const nudges: ClientNudge[] = [
      {
        id: "nudge-1",
        paragraphIndex: 0,
        interventionType: "evidence_lacking",
        message: "What evidence supports this?",
        timestamp: new Date(),
        dismissed: false,
      },
    ];
    render(<NudgePanel nudges={nudges} onDismiss={mockDismiss} />);
    fireEvent.click(screen.getByText("Dismiss"));
    expect(mockDismiss).toHaveBeenCalledWith("nudge-1");
  });
});
