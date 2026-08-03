import { expect, it } from "vitest";
import { eagerComponent } from "./core/registry";
import { eagerComponent as runtimeEagerComponent } from "./runtime";

it("exposes the public Lattice API to standalone plugins", () => {
  expect(runtimeEagerComponent).toBe(eagerComponent);
});
