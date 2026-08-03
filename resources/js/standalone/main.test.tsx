import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { CreateLatticeAppOptions } from "@lattice-php/lattice/create-app";
import type { Plugin } from "@lattice-php/lattice/core/registry";

const createLatticeApp = vi.hoisted(() => vi.fn<(options?: CreateLatticeAppOptions) => unknown>());
const configureEcho = vi.hoisted(() => vi.fn<(config: unknown) => unknown>());
const loadPluginModules = vi.hoisted(() => vi.fn<(urls: string[]) => Promise<Plugin[]>>());
const setRefRefreshEndpoint = vi.hoisted(() => vi.fn());
const withVisitHeaders = vi.hoisted(() => vi.fn());

vi.mock("@lattice-php/lattice/runtime", () => ({
  createLatticeApp,
  setRefRefreshEndpoint,
  withVisitHeaders,
}));
vi.mock("@laravel/echo-react", () => ({ configureEcho }));
vi.mock("./plugins", () => ({ loadPluginModules }));

function setConfigScript(json?: string): void {
  document.body.innerHTML = json
    ? `<script type="application/json" data-lattice-config>${json}</script>`
    : "";
}

beforeEach(() => {
  loadPluginModules.mockResolvedValue([]);
});

afterEach(() => {
  createLatticeApp.mockClear();
  configureEcho.mockClear();
  loadPluginModules.mockReset();
  setRefRefreshEndpoint.mockClear();
  withVisitHeaders.mockClear();
  document.body.innerHTML = "";
});

it("loads configured plugins before booting the app", async () => {
  const plugins = [{ name: "app" }] satisfies Plugin[];
  loadPluginModules.mockResolvedValueOnce(plugins);
  setConfigScript(JSON.stringify({ plugins: ["/plugin.js"] }));
  vi.resetModules();

  const { booted } = await import("./main");
  await booted;

  expect(loadPluginModules).toHaveBeenCalledExactlyOnceWith(["/plugin.js"]);
  expect(createLatticeApp).toHaveBeenCalledWith(expect.objectContaining({ plugins }));
  expect(loadPluginModules.mock.invocationCallOrder[0]).toBeLessThan(
    createLatticeApp.mock.invocationCallOrder[0]!,
  );
});

it("boots with no config script", async () => {
  setConfigScript();
  vi.resetModules();

  const { booted } = await import("./main");
  await booted;

  expect(createLatticeApp).toHaveBeenCalledOnce();
  const options = createLatticeApp.mock.calls[0]?.[0];
  expect(options).not.toHaveProperty("sprite");
  expect(options?.defaults?.visitOptions).toBe(withVisitHeaders);
});

it("passes the sprite href when the config has a spriteUrl", async () => {
  setConfigScript(JSON.stringify({ spriteUrl: "/vendor/lattice/sprite.svg?v=abc" }));
  vi.resetModules();

  const { booted } = await import("./main");
  await booted;

  expect(createLatticeApp).toHaveBeenCalledOnce();
  const options = createLatticeApp.mock.calls[0]?.[0];
  expect(options?.sprite).toEqual({ href: "/vendor/lattice/sprite.svg?v=abc" });
});

it("configures echo before booting the app", async () => {
  setConfigScript(JSON.stringify({ echo: { broadcaster: "reverb" } }));
  vi.resetModules();

  const { booted } = await import("./main");
  await booted;

  expect(createLatticeApp).toHaveBeenCalledOnce();
  expect(configureEcho).toHaveBeenCalledExactlyOnceWith({ broadcaster: "reverb" });
  expect(configureEcho.mock.invocationCallOrder[0]).toBeLessThan(
    createLatticeApp.mock.invocationCallOrder[0]!,
  );
});

it("warns and still boots the app when configuring echo fails", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  configureEcho.mockImplementationOnce(() => {
    throw new Error("boom");
  });
  setConfigScript(JSON.stringify({ echo: { broadcaster: "reverb" } }));
  vi.resetModules();

  const { booted } = await import("./main");
  await booted;

  expect(createLatticeApp).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalledOnce();

  warn.mockRestore();
});
