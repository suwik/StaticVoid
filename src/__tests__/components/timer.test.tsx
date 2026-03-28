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

  const defaultProps = {
    timeLimit: 2700, // 45 minutes in seconds
    onTimeUpdate: vi.fn(),
    onTimerExpired: vi.fn(),
  };

  it("should render initial time based on timeLimit in seconds", () => {
    render(<Timer {...defaultProps} />);
    expect(screen.getByText("45:00")).toBeInTheDocument();
  });

  it("should count down every second", () => {
    render(<Timer {...defaultProps} />);
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

  it("should call onTimeUpdate when ticking", () => {
    const onTimeUpdate = vi.fn();
    render(<Timer {...defaultProps} onTimeUpdate={onTimeUpdate} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onTimeUpdate).toHaveBeenCalled();
  });

  it("should show red text when under 5 minutes", () => {
    render(<Timer {...defaultProps} />);

    // Advance to 4:59 remaining
    act(() => {
      vi.advanceTimersByTime((2700 - 299) * 1000);
    });

    const timerEl = screen.getByText("04:59");
    expect(timerEl.className).toContain("text-red-500");
  });

  it("should show amber text between 5-10 minutes", () => {
    render(<Timer {...defaultProps} />);

    // Advance to 9:59 remaining
    act(() => {
      vi.advanceTimersByTime((2700 - 599) * 1000);
    });

    const timerEl = screen.getByText("09:59");
    expect(timerEl.className).toContain("text-amber-500");
  });

  it("should not count down when disabled", () => {
    render(<Timer {...defaultProps} disabled />);
    expect(screen.getByText("45:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("45:00")).toBeInTheDocument();
  });

  it("should stop at 00:00 and call onTimerExpired", () => {
    const onTimerExpired = vi.fn();
    render(<Timer {...defaultProps} onTimerExpired={onTimerExpired} />);

    act(() => {
      vi.advanceTimersByTime(2700 * 1000);
    });
    expect(screen.getByText("00:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onTimerExpired).toHaveBeenCalled();
  });
});
