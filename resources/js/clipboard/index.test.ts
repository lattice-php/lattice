import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from ".";

function stubClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

afterEach(() => {
  stubClipboard(undefined);
  vi.restoreAllMocks();
});

describe("copyToClipboard", () => {
  it("writes the text and reports success", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    stubClipboard(writeText);

    await expect(copyToClipboard("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("returns false when the clipboard API is unavailable", async () => {
    stubClipboard(undefined);

    await expect(copyToClipboard("hello")).resolves.toBe(false);
  });

  it("returns false when writing rejects", async () => {
    stubClipboard(vi.fn<(text: string) => Promise<void>>().mockRejectedValue(new Error("denied")));

    await expect(copyToClipboard("hello")).resolves.toBe(false);
  });
});
