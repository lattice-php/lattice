import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent, lazyComponent, loadPluginModules } from "./registry";
import type { Plugin } from "./registry";
import type { RendererComponent } from "./index";

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

  it("merges named extension registries", () => {
    const first = vi.fn();
    const second = vi.fn();

    expect(
      createRegistry(
        { name: "first", extensions: { effects: { first } } },
        { name: "second", extensions: { effects: { second } } },
      ),
    ).toMatchObject({ extensions: { effects: { first, second } } });
  });

  it("loads plugin modules through the core registry API", async () => {
    const plugin = { name: "app" } satisfies Plugin;
    const load = vi.fn<(url: string) => Promise<unknown>>().mockResolvedValue({ default: plugin });

    await expect(loadPluginModules(["/plugin.js"], load)).resolves.toEqual([plugin]);
  });

  it("preserves plugin module order", async () => {
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

  it.each([
    { name: "invalid", components: [] },
    { name: "invalid", components: { invalid: null } },
    { name: "invalid", components: { invalid: { mode: "eager", component: null } } },
    { name: "invalid", i18n: {} },
    { name: "invalid", extensions: [] },
    { name: "invalid", extensions: { effects: { invalid: null } } },
  ])("rejects invalid plugin registries", async (plugin) => {
    const load = vi.fn<(url: string) => Promise<unknown>>().mockResolvedValue({ default: plugin });

    await expect(loadPluginModules(["/invalid.js"], load)).rejects.toThrow(
      "[/invalid.js] must default export a Plugin object",
    );
  });
});
