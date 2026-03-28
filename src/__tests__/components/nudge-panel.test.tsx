import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NudgePanel } from "@/components/editor/nudge-panel";

describe("NudgePanel", () => {
  it("should render empty state when no nudges", () => {
    render(<NudgePanel sessionId="test-id" />);
    expect(screen.getByText("AI Coach")).toBeInTheDocument();
    expect(
      screen.getByText("Feedback will appear here as you write.")
    ).toBeInTheDocument();
  });

  it("should have correct width styling", () => {
    const { container } = render(<NudgePanel sessionId="test-id" />);
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain("w-80");
    expect(panel.className).toContain("border-l");
  });
});
