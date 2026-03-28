import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthForm } from "@/components/auth/auth-form";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("AuthForm", () => {
  it("should render email and password fields", () => {
    render(<AuthForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should render sign in button by default", () => {
    render(<AuthForm />);
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("should toggle to sign up mode", () => {
    render(<AuthForm />);

    fireEvent.click(screen.getByText("Need an account? Sign up"));
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByText("Already have an account? Sign in")).toBeInTheDocument();
  });

  it("should toggle back to sign in mode", () => {
    render(<AuthForm />);

    fireEvent.click(screen.getByText("Need an account? Sign up"));
    fireEvent.click(screen.getByText("Already have an account? Sign in"));
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("should update email field on input", () => {
    render(<AuthForm />);
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });

  it("should require minimum 6 character password", () => {
    render(<AuthForm />);
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.minLength).toBe(6);
  });
});
