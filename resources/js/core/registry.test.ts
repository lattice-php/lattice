import { describe, expect, it } from "vitest";
import { createPlugin, createRegistry, eagerComponent, lazyComponent } from "@lattice/lattice";
import type { RendererComponent } from "./types";

const EagerComponent: RendererComponent<"test.eager"> = () => null;
const FallbackComponent: RendererComponent<"test.eager"> = () => null;

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
    const firstPlugin = createPlugin({
      components: {
        first: eagerComponent(EagerComponent),
      },
      name: "first",
    });
    const secondPlugin = createPlugin({
      components: {
        second: eagerComponent(EagerComponent),
      },
      name: "second",
    });

    expect(createRegistry(firstPlugin, secondPlugin)).toHaveProperty("components.first");
    expect(createRegistry(firstPlugin, secondPlugin)).toHaveProperty("components.second");
  });
});
