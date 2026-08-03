import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton, CopyableText, copyToClipboard } from "./copyable-text";

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

  it("copies the value and swaps the button label on click", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    stubClipboard(writeText);

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

  it("renders a custom idle label", () => {
    render(
      <CopyButton value="tok_secret" label="API token">
        Copy token
      </CopyButton>,
    );

    expect(screen.getByRole("button", { name: "Copy API token" })).toHaveTextContent("Copy token");
  });

  it("does not report success when copying fails", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockRejectedValue(new Error("denied"));
    stubClipboard(writeText);

    render(<CopyButton value="tok_secret" label="API token" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy API token" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("tok_secret"));
    expect(screen.getByRole("button", { name: "Copy API token" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copied API token" })).not.toBeInTheDocument();
  });
});

describe("copyToClipboard", () => {
  it("writes the text and reports success", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    stubClipboard(writeText);

    await expect(copyToClipboard("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("returns false when the clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });

    await expect(copyToClipboard("hello")).resolves.toBe(false);
  });

  it("returns false when writing rejects", async () => {
    stubClipboard(vi.fn<(text: string) => Promise<void>>().mockRejectedValue(new Error("denied")));

    await expect(copyToClipboard("hello")).resolves.toBe(false);
  });
});
