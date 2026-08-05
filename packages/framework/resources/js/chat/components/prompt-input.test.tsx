import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptInput } from "./prompt-input";

describe("PromptInput", () => {
  it("calls onSubmit with the text and clears the input on Enter", () => {
    const onSubmit = vi.fn<(text: string) => void>();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByTestId("chat-input");
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onSubmit).toHaveBeenCalledWith("Hello world");
    expect(textarea).toHaveValue("");
  });

  it("does not submit blank text on Enter", () => {
    const onSubmit = vi.fn<(text: string) => void>();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByTestId("chat-input");
    fireEvent.change(textarea, { target: { value: "   " } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit on Shift+Enter (inserts newline instead)", () => {
    const onSubmit = vi.fn<(text: string) => void>();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByTestId("chat-input");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("Hello");
  });

  it("calls onSubmit when the Send button is clicked", () => {
    const onSubmit = vi.fn<(text: string) => void>();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByTestId("chat-input");
    fireEvent.change(textarea, { target: { value: "Button submit" } });
    fireEvent.click(screen.getByTestId("chat-send"));

    expect(onSubmit).toHaveBeenCalledWith("Button submit");
    expect(textarea).toHaveValue("");
  });

  it("blocks submit and disables controls when disabled", () => {
    const onSubmit = vi.fn<(text: string) => void>();
    render(<PromptInput onSubmit={onSubmit} disabled />);

    const textarea = screen.getByTestId("chat-input") as HTMLTextAreaElement;
    const button = screen.getByTestId("chat-send") as HTMLButtonElement;

    fireEvent.change(textarea, { target: { value: "test" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("renders the placeholder text", () => {
    render(
      <PromptInput onSubmit={vi.fn<(text: string) => void>()} placeholder="Type a message…" />,
    );

    expect(screen.getByPlaceholderText("Type a message…")).toBeInTheDocument();
  });
});
