import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { stubClipboard } from "@lattice-php/core/test-support";
import { CopyButton, CopyableText, copyToClipboard } from "./copyable-text";

function rejectingClipboard() {
  return stubClipboard(vi.fn<Clipboard["writeText"]>().mockRejectedValue(new Error("denied")));
}

describe("CopyableText", () => {
  it("copies the value and swaps the button label on click", async () => {
    const writeText = stubClipboard();

    render(<CopyableText value="tok_secret" label="API token" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy API token" }));

    expect(writeText).toHaveBeenCalledWith("tok_secret");
    expect(await screen.findByRole("button", { name: "Copied API token" })).toBeInTheDocument();
  });

  it("falls back to the value when no children are given", () => {
    render(<CopyableText value="tok_secret" label="API token" />);

    expect(screen.getByText("tok_secret")).toBeInTheDocument();
  });
});

describe("CopyButton", () => {
  it("renders an icon-only button with an accessible label", () => {
    render(<CopyButton value="tok_secret" label="API token" iconOnly />);

    expect(screen.getByRole("button", { name: "Copy API token" })).not.toHaveTextContent("Copy");
  });

  it("does not report success when copying fails", async () => {
    const writeText = rejectingClipboard();

    render(<CopyButton value="tok_secret" label="API token" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy API token" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("tok_secret"));
    expect(screen.getByRole("button", { name: "Copy API token" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copied API token" })).not.toBeInTheDocument();
  });
});

describe("copyToClipboard", () => {
  it("writes the text and reports success", async () => {
    const writeText = stubClipboard();

    await expect(copyToClipboard("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("returns false when the clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });

    await expect(copyToClipboard("hello")).resolves.toBe(false);
  });

  it("returns false when writing rejects", async () => {
    rejectingClipboard();

    await expect(copyToClipboard("hello")).resolves.toBe(false);
  });
});
