import { describe, expect, it, vi } from "vitest";
import { dispatchEffects, getActionEffects, isActionEffect } from "./dispatch";
import type { EffectHandlerRegistry } from "./registry";

describe("dispatchEffects", () => {
  it("routes each effect to its registered handler", () => {
    const toast = vi.fn<() => void>();
    const handlers: EffectHandlerRegistry = { toast };

    dispatchEffects(
      [{ type: "toast", toast: { variant: "success", message: "hi" } }] as never,
      handlers,
    );

    expect(toast).toHaveBeenCalledOnce();
  });

  it("warns and skips an effect with no registered handler", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    dispatchEffects([{ type: "confetti" }] as never, {});

    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("isActionEffect", () => {
  it("accepts any object with a string type", () => {
    expect(isActionEffect({ type: "confetti" })).toBe(true);
    expect(isActionEffect({ nope: 1 })).toBe(false);
    expect(isActionEffect(null)).toBe(false);
  });
});

describe("getActionEffects", () => {
  it("filters a flash payload to valid effects", () => {
    expect(getActionEffects([{ type: "toast" }, 7, { x: 1 }])).toHaveLength(1);
    expect(getActionEffects("nope")).toEqual([]);
  });
});
