import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StatsView } from "@/components/session/stats-view";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockStats = {
  session_id: "test-id",
  question: "Evaluate the impact of globalisation.",
  total_nudges: 3,
  nudges_by_type: {
    evaluation_depth: 2,
    structure_drift: 1,
  },
  student_responses: {
    revised: 1,
    read: 1,
    dismissed: 1,
  },
  time_limit: 2700,
  time_used: 1680,
  status: "completed",
  interventions: [
    {
      id: "i1",
      session_id: "test-id",
      paragraph_index: 0,
      paragraph_text: "First paragraph text here",
      intervention_type: "evaluation_depth",
      message: "What does this mean for the business?",
      student_response: "revised",
      created_at: "2026-03-28T13:00:00Z",
    },
    {
      id: "i2",
      session_id: "test-id",
      paragraph_index: 1,
      paragraph_text: "Second paragraph text",
      intervention_type: "evaluation_depth",
      message: "How does this impact stakeholders?",
      student_response: "read",
      created_at: "2026-03-28T13:05:00Z",
    },
    {
      id: "i3",
      session_id: "test-id",
      paragraph_index: 2,
      paragraph_text: "Third paragraph text",
      intervention_type: "structure_drift",
      message: "How does this connect to the question?",
      student_response: "dismissed",
      created_at: "2026-03-28T13:10:00Z",
    },
  ],
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockStats),
  });
});

describe("StatsView", () => {
  it("should show loading state initially", () => {
    render(<StatsView sessionId="test-id" />);
    expect(screen.getByText("Loading stats...")).toBeInTheDocument();
  });

  it("should render summary cards with real data", async () => {
    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText("Nudges Received")).toBeInTheDocument();
    });
    expect(screen.getByText("Self-corrections")).toBeInTheDocument();
    expect(screen.getByText("Time Used")).toBeInTheDocument();
    expect(screen.getByText("Word Count")).toBeInTheDocument();
  });

  it("should display time used in human-readable format", async () => {
    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText("28m 00s")).toBeInTheDocument();
    });
  });

  it("should show intervention type breakdown with bar chart", async () => {
    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText("Intervention Breakdown")).toBeInTheDocument();
    });
    // Type labels appear in the breakdown section (and possibly in timeline)
    expect(screen.getAllByText("Evaluation Depth").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Structure Drift").length).toBeGreaterThanOrEqual(1);
  });

  it("should show response breakdown", async () => {
    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText("How You Responded")).toBeInTheDocument();
    });
    expect(screen.getByText("Revised")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Dismissed")).toBeInTheDocument();
  });

  it("should show intervention timeline", async () => {
    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText("Intervention Timeline")).toBeInTheDocument();
    });
    expect(
      screen.getByText("What does this mean for the business?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("How does this impact stakeholders?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("How does this connect to the question?")
    ).toBeInTheDocument();
  });

  it("should show essay question", async () => {
    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(
        screen.getByText("Evaluate the impact of globalisation.")
      ).toBeInTheDocument();
    });
  });

  it("should show 'no nudges' message when zero interventions", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ...mockStats,
          total_nudges: 0,
          nudges_by_type: {},
          student_responses: {},
          interventions: [],
        }),
    });

    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(
        screen.getByText("Great job, no nudges needed!")
      ).toBeInTheDocument();
    });
  });

  it("should show error state on API failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load stats")).toBeInTheDocument();
    });
  });

  it("should show navigation buttons", async () => {
    render(<StatsView sessionId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });
});
