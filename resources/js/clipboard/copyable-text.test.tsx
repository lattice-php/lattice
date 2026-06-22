import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyableText } from "./copyable-text";

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  vi.restoreAllMocks();
});

describe("CopyableText", () => {
  it("renders its children alongside a copy button", () => {
    render(
      <CopyableText value="tok_secret" label="API token">
        <span>shown</span>
      </CopyableText>,
    );

    expect(screen.getByText("shown")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy API token" })).toBeInTheDocument();
  });

  it("copies the value and swaps the button label on click", () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    stubClipboard(writeText);

    render(<CopyableText value="tok_secret" label="API token" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy API token" }));

    expect(writeText).toHaveBeenCalledWith("tok_secret");
    expect(screen.getByRole("button", { name: "Copied API token" })).toBeInTheDocument();
  });

  it("falls back to the value when no children are given", () => {
    render(<CopyableText value="tok_secret" label="API token" />);

    expect(screen.getByText("tok_secret")).toBeInTheDocument();
  });
});
