import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsView } from "@/components/session/stats-view";

describe("StatsView", () => {
  it("should render all stat cards", () => {
    render(<StatsView sessionId="test-id" />);

    expect(screen.getByText("Nudges Received")).toBeInTheDocument();
    expect(screen.getByText("Self-corrections")).toBeInTheDocument();
    expect(screen.getByText("Time Used")).toBeInTheDocument();
  });

  it("should render skill breakdown section", () => {
    render(<StatsView sessionId="test-id" />);
    expect(screen.getByText("Skill Breakdown")).toBeInTheDocument();
  });

  it("should show placeholder values", () => {
    render(<StatsView sessionId="test-id" />);
    const dashes = screen.getAllByText("-");
    expect(dashes).toHaveLength(3);
  });
});
