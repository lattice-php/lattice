import { describe, expect, it, vi } from "vitest";
import { isTranslatable, resolveTranslatable } from "./translatable";

describe("isTranslatable", () => {
  it("detects a translatable by its string key, rejects everything else", () => {
    expect(isTranslatable({ key: "a", payload: {}, replacements: {} })).toBe(true);
    expect(isTranslatable("plain")).toBe(false);
    expect(isTranslatable(null)).toBe(false);
    expect(isTranslatable({})).toBe(false);
  });
});

describe("resolveTranslatable", () => {
  const t = vi.fn<(key: string, _default?: string, options?: Record<string, unknown>) => string>(
    (key, _default, options) => `${key}:${JSON.stringify(options ?? {})}`,
  );

  it("merges static replacements under dotted payload values", () => {
    resolveTranslatable(
      { key: "k", payload: { id: "order.id" }, replacements: { warehouse: "Berlin" } },
      { order: { id: 7 } },
      t,
    );
    expect(t).toHaveBeenCalledWith("k", "k", { warehouse: "Berlin", id: 7 });
  });

  it("resolves a missing payload path to an empty string", () => {
    resolveTranslatable(
      { key: "k", payload: { id: "order.missing" }, replacements: {} },
      { order: {} },
      t,
    );
    expect(t).toHaveBeenLastCalledWith("k", "k", { id: "" });
  });

  it("resolves with only static replacements when there is no payload", () => {
    resolveTranslatable({ key: "k", payload: {}, replacements: { name: "X" } }, {}, t);
    expect(t).toHaveBeenLastCalledWith("k", "k", { name: "X" });
  });
});
