import { describe, expect, it } from "vitest";
import {
  createLatticePlugin,
  createLatticeRegistry,
  eagerComponent,
  lazyComponent,
} from "./registry";
import type { LatticeRendererComponent } from "./types";

const EagerComponent: LatticeRendererComponent<"test.eager"> = () => null;
const FallbackComponent: LatticeRendererComponent<"test.eager"> = () => null;

describe("lattice registry", () => {
  it("registers eager components without a loader", () => {
    const registration = eagerComponent(EagerComponent);

    expect(registration).toMatchObject({
      component: EagerComponent,
      mode: "eager",
    });
    expect("load" in registration).toBe(false);
  });

  it("registers lazy components with a cached React component wrapper", () => {
    const load = () =>
      Promise.resolve({
        default: EagerComponent,
      });

    const registration = lazyComponent(load);

    expect(registration.mode).toBe("lazy");
    expect(registration.load).toBe(load);
    expect(registration.component).toBeTypeOf("object");
  });

  it("registers lazy components with an optional fallback", () => {
    const load = () =>
      Promise.resolve({
        default: EagerComponent,
      });

    const registration = lazyComponent(load, {
      fallback: FallbackComponent,
    });

    expect(registration.fallback).toBe(FallbackComponent);
  });

  it("merges plugins into a registry", () => {
    const firstPlugin = createLatticePlugin({
      components: {
        first: eagerComponent(EagerComponent),
      },
      name: "first",
    });
    const secondPlugin = createLatticePlugin({
      components: {
        second: eagerComponent(EagerComponent),
      },
      name: "second",
    });

    expect(createLatticeRegistry(firstPlugin, secondPlugin)).toHaveProperty("first");
    expect(createLatticeRegistry(firstPlugin, secondPlugin)).toHaveProperty("second");
  });
});
