import { expect, it } from "vitest";
import { eagerComponent, loadPluginModules } from "@lattice-php/core/registry";
import {
  eagerComponent as runtimeEagerComponent,
  loadPluginModules as runtimeLoadPluginModules,
} from "./runtime";

it("exposes the public Lattice API to standalone plugins", () => {
  expect(runtimeEagerComponent).toBe(eagerComponent);
  expect(runtimeLoadPluginModules).toBe(loadPluginModules);
});
