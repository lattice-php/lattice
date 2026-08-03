import { expect, it, vi } from "vitest";
import type { Plugin } from "@lattice-php/lattice/core/registry";
import { loadPluginModules } from "./plugins";

it("loads plugin modules in configuration order", async () => {
  const first = { name: "first" } satisfies Plugin;
  const second = { name: "second" } satisfies Plugin;
  const load = vi
    .fn<(url: string) => Promise<unknown>>()
    .mockResolvedValueOnce({ default: first })
    .mockResolvedValueOnce({ default: second });

  await expect(loadPluginModules(["/first.js", "/second.js"], load)).resolves.toEqual([
    first,
    second,
  ]);
  expect(load).toHaveBeenNthCalledWith(1, "/first.js");
  expect(load).toHaveBeenNthCalledWith(2, "/second.js");
});

it.each([{}, { default: null }, { default: {} }, { default: { name: "" } }])(
  "rejects a module without a valid default plugin export",
  async (module) => {
    const load = vi.fn<(url: string) => Promise<unknown>>().mockResolvedValue(module);

    await expect(loadPluginModules(["/invalid.js"], load)).rejects.toThrow(
      "[/invalid.js] must default export a Plugin object",
    );
  },
);

it("rejects invalid plugin registry maps", async () => {
  const load = vi
    .fn<(url: string) => Promise<unknown>>()
    .mockResolvedValue({ default: { name: "invalid", components: [] } });

  await expect(loadPluginModules(["/invalid.js"], load)).rejects.toThrow(
    "[/invalid.js] must default export a Plugin object",
  );
});

it.each([
  { name: "invalid", components: { invalid: null } },
  { name: "invalid", components: { invalid: { mode: "eager", component: null } } },
  { name: "invalid", columns: { invalid: null } },
  { name: "invalid", effects: { invalid: "not-a-function" } },
  { name: "invalid", i18n: {} },
])("rejects invalid plugin entries", async (plugin) => {
  const load = vi.fn<(url: string) => Promise<unknown>>().mockResolvedValue({ default: plugin });

  await expect(loadPluginModules(["/invalid.js"], load)).rejects.toThrow(
    "[/invalid.js] must default export a Plugin object",
  );
});
