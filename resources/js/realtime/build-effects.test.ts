import { describe, expect, it, vi } from "vitest";
import type { EffectOf } from "@lattice-php/lattice/effects/registry";
import { buildEffects } from "./build-effects";

const t = vi.fn<(key: string, defaultValue?: string, options?: Record<string, unknown>) => string>(
  (key: string, _def?: string, options?: Record<string, unknown>) =>
    `t:${key}:${JSON.stringify(options ?? {})}`,
);

describe("buildEffects", () => {
  it("passes a plain-string toast message through unchanged", () => {
    const effects = [{ type: "toast", props: { variant: "success", message: "Order shipped" } }];

    const [effect] = buildEffects(effects, {}, t) as EffectOf<"toast">[];

    expect(effect.props.message).toBe("Order shipped");
  });

  it("resolves a Translatable toast message via t() with merged replacements", () => {
    const effects = [
      {
        type: "toast",
        props: {
          variant: "success",
          message: {
            key: "orders.shipped-live",
            payload: { id: "order.id" },
            replacements: { warehouse: "Berlin" },
          },
        },
      },
    ];

    const [effect] = buildEffects(effects, { order: { id: 42 } }, t) as EffectOf<"toast">[];

    expect(t).toHaveBeenCalledWith("orders.shipped-live", "orders.shipped-live", {
      warehouse: "Berlin",
      id: 42,
    });
    expect(effect.props.message).toBe('t:orders.shipped-live:{"warehouse":"Berlin","id":42}');
  });

  it("resolves a missing payload path to an empty string", () => {
    const effects = [
      {
        type: "toast",
        props: {
          message: { key: "k", payload: { id: "order.missing" }, replacements: {} },
        },
      },
    ];

    buildEffects(effects, { order: {} }, t);

    expect(t).toHaveBeenLastCalledWith("k", "k", { id: "" });
  });

  it("leaves non-toast effects untouched", () => {
    const effects = [{ type: "reload-page" }];

    expect(buildEffects(effects, {}, t)).toEqual([{ type: "reload-page" }]);
  });

  it("does not mutate the input effect objects", () => {
    const message = { key: "k", payload: {}, replacements: {} };
    const effects = [{ type: "toast", props: { message } }];

    buildEffects(effects, {}, t);

    expect(effects[0]).toEqual({ type: "toast", props: { message } });
  });
});
