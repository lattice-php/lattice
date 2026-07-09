import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard, useClipboard } from ".";

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

describe("useClipboard", () => {
  it("tracks the copied text after a successful copy", async () => {
    stubClipboard(vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined));

    const { result } = renderHook(() => useClipboard());
    expect(result.current[0]).toBeNull();

    let copied = false;
    await act(async () => {
      copied = await result.current[1]("copied value");
    });

    expect(copied).toBe(true);
    expect(result.current[0]).toBe("copied value");
  });

  it("resets the copied text when a copy fails", async () => {
    stubClipboard(undefined);

    const { result } = renderHook(() => useClipboard());

    let copied = true;
    await act(async () => {
      copied = await result.current[1]("never stored");
    });

    expect(copied).toBe(false);
    expect(result.current[0]).toBeNull();
  });
});
