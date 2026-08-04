import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePersistentState } from "./use-persistent-state";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("usePersistentState", () => {
  it("reads the stored value and persists updates", () => {
    window.localStorage.setItem("k", JSON.stringify(1));

    const { result } = renderHook(() => usePersistentState<number>("k", 0));

    expect(result.current[0]).toBe(1);

    act(() => result.current[1](5));

    expect(result.current[0]).toBe(5);
    expect(window.localStorage.getItem("k")).toBe("5");
  });

  it("supports custom parse/serialize and removes when serialize returns null", () => {
    const { result } = renderHook(() =>
      usePersistentState<Set<string>>("s", () => new Set(), {
        parse: (raw) => new Set(JSON.parse(raw) as string[]),
        serialize: (set) => (set.size === 0 ? null : JSON.stringify([...set])),
      }),
    );

    act(() => result.current[1](new Set(["a", "b"])));
    expect(window.localStorage.getItem("s")).toBe('["a","b"]');

    act(() => result.current[1](new Set()));
    expect(window.localStorage.getItem("s")).toBeNull();
  });

  it("falls back and never writes when disabled", () => {
    window.localStorage.setItem("d", JSON.stringify(9));
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    const { result } = renderHook(() => usePersistentState<number>("d", 0, { enabled: false }));

    expect(result.current[0]).toBe(0);

    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);
    expect(setItem).not.toHaveBeenCalled();
  });

  it("falls back to the default when reading throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    const { result } = renderHook(() => usePersistentState<number>("x", 42));

    expect(result.current[0]).toBe(42);
  });
});
