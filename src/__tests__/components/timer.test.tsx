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

  describe("rendering", () => {
    it("should render initial time from seconds", () => {
      render(<Timer {...defaultProps} />);
      expect(screen.getByText("45:00")).toBeInTheDocument();
    });

    it("should handle custom time limits", () => {
      render(<Timer {...defaultProps} timeLimit={600} />);
      expect(screen.getByText("10:00")).toBeInTheDocument();
    });

    it("should handle short time limits", () => {
      render(<Timer {...defaultProps} timeLimit={90} />);
      expect(screen.getByText("01:30")).toBeInTheDocument();
    });
  });

  describe("countdown", () => {
    it("should count down every second", () => {
      render(<Timer {...defaultProps} />);
      expect(screen.getByText("45:00")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByText("44:59")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByText("44:58")).toBeInTheDocument();
    });

    it("should call onTimeUpdate on each tick", () => {
      const onTimeUpdate = vi.fn();
      render(<Timer {...defaultProps} onTimeUpdate={onTimeUpdate} />);

      act(() => vi.advanceTimersByTime(3000));
      expect(onTimeUpdate).toHaveBeenCalled();
    });

    it("should not count down when disabled", () => {
      render(<Timer {...defaultProps} disabled />);
      expect(screen.getByText("45:00")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(5000));
      expect(screen.getByText("45:00")).toBeInTheDocument();
    });

    it("should stop at 00:00", () => {
      render(<Timer {...defaultProps} />);

      act(() => vi.advanceTimersByTime(2700 * 1000));
      expect(screen.getByText("00:00")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(5000));
      expect(screen.getByText("00:00")).toBeInTheDocument();
    });

    it("should call onTimerExpired when reaching zero", () => {
      const onTimerExpired = vi.fn();
      render(<Timer {...defaultProps} onTimerExpired={onTimerExpired} />);

      act(() => vi.advanceTimersByTime(2700 * 1000));
      act(() => vi.advanceTimersByTime(1));
      expect(onTimerExpired).toHaveBeenCalledTimes(1);
    });

    it("should not call onTimerExpired multiple times", () => {
      const onTimerExpired = vi.fn();
      render(<Timer {...defaultProps} onTimerExpired={onTimerExpired} />);

      act(() => vi.advanceTimersByTime(2700 * 1000 + 5000));
      act(() => vi.advanceTimersByTime(1));
      expect(onTimerExpired).toHaveBeenCalledTimes(1);
    });
  });

  describe("color states", () => {
    it("should show default color when plenty of time", () => {
      render(<Timer {...defaultProps} />);
      const el = screen.getByText("45:00");
      expect(el.className).toContain("text-foreground");
      expect(el.className).not.toContain("text-amber");
      expect(el.className).not.toContain("text-destructive");
    });

    it("should show amber warning between 5-10 minutes", () => {
      render(<Timer {...defaultProps} />);

      act(() => vi.advanceTimersByTime((2700 - 599) * 1000));
      const el = screen.getByText("09:59");
      expect(el.className).toContain("text-amber");
    });

    it("should show critical style under 5 minutes", () => {
      render(<Timer {...defaultProps} />);

      act(() => vi.advanceTimersByTime((2700 - 299) * 1000));
      const el = screen.getByText("04:59");
      expect(el.className).toContain("text-destructive");
    });

    it("should pulse animation when critical", () => {
      render(<Timer {...defaultProps} />);

      act(() => vi.advanceTimersByTime((2700 - 299) * 1000));
      const el = screen.getByText("04:59");
      expect(el.className).toContain("animate-pulse");
    });

    it("should transition from amber to critical at 5 minutes", () => {
      render(<Timer {...defaultProps} />);

      act(() => vi.advanceTimersByTime((2700 - 300) * 1000));
      const amberEl = screen.getByText("05:00");
      expect(amberEl.className).toContain("text-amber");

      act(() => vi.advanceTimersByTime(1000));
      const criticalEl = screen.getByText("04:59");
      expect(criticalEl.className).toContain("text-destructive");
    });
  });
});
