import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SetupForm } from "@/components/session/setup-form";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("SetupForm", () => {
  it("should render all form fields", () => {
    render(<SetupForm />);

    expect(screen.getByLabelText("Essay Question")).toBeInTheDocument();
    expect(screen.getByLabelText("Mark Scheme Criteria")).toBeInTheDocument();
    expect(screen.getByLabelText("Time Limit (minutes)")).toBeInTheDocument();
  });

  it("should have default time limit of 45 minutes", () => {
    render(<SetupForm />);
    const timeInput = screen.getByLabelText("Time Limit (minutes)") as HTMLInputElement;
    expect(timeInput.value).toBe("45");
  });

  it("should render submit button", () => {
    render(<SetupForm />);
    expect(screen.getByRole("button", { name: "Start Session" })).toBeInTheDocument();
  });

  it("should update question field on input", () => {
    render(<SetupForm />);
    const questionInput = screen.getByLabelText("Essay Question") as HTMLTextAreaElement;

    fireEvent.change(questionInput, {
      target: { value: "Evaluate the impact of AI on education" },
    });

    expect(questionInput.value).toBe("Evaluate the impact of AI on education");
  });

  it("should update mark scheme field on input", () => {
    render(<SetupForm />);
    const markSchemeInput = screen.getByLabelText("Mark Scheme Criteria") as HTMLTextAreaElement;

    fireEvent.change(markSchemeInput, {
      target: { value: "AO1: 4 marks, AO2: 4 marks" },
    });

    expect(markSchemeInput.value).toBe("AO1: 4 marks, AO2: 4 marks");
  });

  it("should have min and max constraints on time limit", () => {
    render(<SetupForm />);
    const timeInput = screen.getByLabelText("Time Limit (minutes)") as HTMLInputElement;

    expect(timeInput.min).toBe("5");
    expect(timeInput.max).toBe("180");
  });
});
