import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Timer } from "@/components/editor/timer";

describe("Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render initial time as 45:00", () => {
    render(<Timer sessionId="test-id" />);
    expect(screen.getByText("45:00")).toBeInTheDocument();
  });

  it("should count down every second", () => {
    render(<Timer sessionId="test-id" />);
    expect(screen.getByText("45:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("44:59")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("44:58")).toBeInTheDocument();
  });

  it("should show red text when under 5 minutes", () => {
    render(<Timer sessionId="test-id" />);

    // Advance to 40 minutes and 1 second (4:59 remaining)
    act(() => {
      vi.advanceTimersByTime((45 * 60 - 299) * 1000);
    });

    const timerEl = screen.getByText("04:59");
    expect(timerEl.className).toContain("text-red-500");
  });

  it("should not show red text when over 5 minutes", () => {
    render(<Timer sessionId="test-id" />);

    const timerEl = screen.getByText("45:00");
    expect(timerEl.className).not.toContain("text-red-500");
    expect(timerEl.className).toContain("text-muted-foreground");
  });

  it("should stop at 00:00", () => {
    render(<Timer sessionId="test-id" />);

    act(() => {
      vi.advanceTimersByTime(45 * 60 * 1000);
    });
    expect(screen.getByText("00:00")).toBeInTheDocument();

    // Advance more — should stay at 00:00
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });
});
