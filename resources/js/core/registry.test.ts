import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent, lazyComponent } from "@lattice-php/lattice";
import type { Plugin } from "@lattice-php/lattice";
import type { RendererComponent } from "./types";

const EagerComponent: RendererComponent<"test.eager"> = () => null;

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

  it("merges plugins into a registry", () => {
    const firstPlugin = {
      components: {
        first: eagerComponent(EagerComponent),
      },
      name: "first",
    } satisfies Plugin;
    const secondPlugin = {
      components: {
        second: eagerComponent(EagerComponent),
      },
      name: "second",
    } satisfies Plugin;

    expect(createRegistry(firstPlugin, secondPlugin)).toHaveProperty("components.first");
    expect(createRegistry(firstPlugin, secondPlugin)).toHaveProperty("components.second");
  });
});
