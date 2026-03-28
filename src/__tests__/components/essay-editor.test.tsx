import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EssayEditor } from "@/components/editor/essay-editor";

// Mock fetch globally
global.fetch = vi.fn();

describe("EssayEditor", () => {
  it("should render a textarea with placeholder", () => {
    render(<EssayEditor sessionId="test-id" />);
    const textarea = screen.getByPlaceholderText(
      /Start writing your essay here/
    );
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("should be a full-width resizable textarea", () => {
    render(<EssayEditor sessionId="test-id" />);
    const textarea = screen.getByPlaceholderText(
      /Start writing your essay here/
    );
    expect(textarea.className).toContain("w-full");
    expect(textarea.className).toContain("resize-none");
  });

  it("should update content on typing", () => {
    render(<EssayEditor sessionId="test-id" />);
    const textarea = screen.getByPlaceholderText(
      /Start writing your essay here/
    );

    fireEvent.change(textarea, {
      target: { value: "This is a test paragraph." },
    });

    expect(textarea).toHaveValue("This is a test paragraph.");
  });

  it("should trigger API call when a paragraph is completed (double newline)", () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          should_intervene: false,
          type: null,
          message: null,
        }),
    });
    global.fetch = mockFetch;

    render(<EssayEditor sessionId="test-session" />);
    const textarea = screen.getByPlaceholderText(
      /Start writing your essay here/
    );

    // Type first paragraph then double newline then start second
    fireEvent.change(textarea, {
      target: {
        value:
          "First paragraph about globalisation.\n\nSecond paragraph starting here.",
      },
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/intervene", expect.objectContaining({
      method: "POST",
    }));
  });

  it("should not trigger API call for single paragraph", () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    render(<EssayEditor sessionId="test-session" />);
    const textarea = screen.getByPlaceholderText(
      /Start writing your essay here/
    );

    fireEvent.change(textarea, {
      target: { value: "Just one paragraph, no double newline yet." },
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
