import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent, lazyComponent, loadPluginModules } from "./registry";
import type { Plugin } from "./registry";
import type { RendererComponent, RendererComponentModule } from "./index";

const EagerComponent: RendererComponent<"test.eager"> = () => null;

describe("lattice registry", () => {
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

    expect(createRegistry(firstPlugin, secondPlugin)).toEqual({
      components: {
        first: firstPlugin.components.first,
        second: secondPlugin.components.second,
      },
      extensions: {},
    });
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
    const plugin = {
      name: "app",
      extensions: {
        "form.rich-editor": {
          stamp: { group: "custom" },
        },
      },
    } satisfies Plugin;
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

  describe("lazy chunk retry", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("recovers a transient chunk-fetch failure on a later retry", async () => {
      const module: RendererComponentModule<"test.eager"> = { default: EagerComponent };
      const load = vi
        .fn<() => Promise<RendererComponentModule<"test.eager">>>()
        .mockRejectedValueOnce(new Error("first failure"))
        .mockRejectedValueOnce(new Error("second failure"))
        .mockResolvedValue(module);

      const pending = expect(lazyComponent(load).load()).resolves.toBe(module);
      await vi.runAllTimersAsync();

      await pending;
      expect(load).toHaveBeenCalledTimes(3);
    });

    it("surfaces the original error once every retry fails", async () => {
      const load = vi
        .fn<() => Promise<RendererComponentModule<"test.eager">>>()
        .mockRejectedValueOnce(new Error("original failure"))
        .mockRejectedValue(new Error("later failure"));

      const pending = expect(lazyComponent(load).load()).rejects.toThrow("original failure");
      await vi.runAllTimersAsync();

      await pending;
      expect(load).toHaveBeenCalledTimes(4);
    });
  });

  it.each([
    { name: "invalid", components: [] },
    { name: "invalid", components: { invalid: null } },
    { name: "invalid", components: { invalid: { mode: "eager", component: null } } },
    { name: "invalid", i18n: {} },
    { name: "invalid", extensions: [] },
  ])("rejects invalid plugin registries", async (plugin) => {
    const load = vi.fn<(url: string) => Promise<unknown>>().mockResolvedValue({ default: plugin });

    await expect(loadPluginModules(["/invalid.js"], load)).rejects.toThrow(
      "[/invalid.js] must default export a Plugin object",
    );
  });
});
