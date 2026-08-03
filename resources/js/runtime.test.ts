import { expect, it } from "vitest";
import { router } from "@inertiajs/react";
import { eagerComponent, loadPluginModules } from "./core/registry";
import {
  eagerComponent as runtimeEagerComponent,
  loadPluginModules as runtimeLoadPluginModules,
  router as runtimeRouter,
} from "./runtime";

it("exposes the public Lattice API to standalone plugins", () => {
  expect(runtimeEagerComponent).toBe(eagerComponent);
  expect(runtimeLoadPluginModules).toBe(loadPluginModules);
  expect(runtimeRouter).toBe(router);
});
