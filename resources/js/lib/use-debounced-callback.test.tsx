import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedCallback } from "./use-debounced-callback";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useDebouncedCallback", () => {
  it("fires once with the latest args after the delay", () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 100));

    act(() => {
      result.current("a");
      result.current("b");
    });

    expect(spy).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(100));

    expect(spy).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("clears the pending timer on unmount", () => {
    const spy = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(spy, 100));

    act(() => result.current("x"));
    unmount();
    act(() => vi.advanceTimersByTime(200));

    expect(spy).not.toHaveBeenCalled();
  });

  it("cancel() drops a scheduled call", () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 100));

    act(() => {
      result.current("x");
      result.current.cancel();
      vi.advanceTimersByTime(200);
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
