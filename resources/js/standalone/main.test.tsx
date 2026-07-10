import { afterEach, expect, it, vi } from "vitest";
import type { CreateLatticeAppOptions } from "@lattice-php/lattice/create-app";

const createLatticeApp = vi.hoisted(() => vi.fn<(options?: CreateLatticeAppOptions) => unknown>());
const configureEcho = vi.hoisted(() => vi.fn<(config: unknown) => unknown>());

vi.mock("@lattice-php/lattice/create-app", () => ({ createLatticeApp }));
vi.mock("@laravel/echo-react", () => ({ configureEcho }));

function setConfigScript(json?: string): void {
  document.body.innerHTML = json
    ? `<script type="application/json" data-lattice-config>${json}</script>`
    : "";
}

afterEach(() => {
  createLatticeApp.mockClear();
  configureEcho.mockClear();
  document.body.innerHTML = "";
});

it("boots with no config script", async () => {
  setConfigScript();
  vi.resetModules();

  const { withVisitHeaders } = await import("@lattice-php/lattice/inertia");
  await import("./main");
  await vi.waitFor(() => expect(createLatticeApp).toHaveBeenCalledOnce());

  const options = createLatticeApp.mock.calls[0]?.[0];
  expect(options).not.toHaveProperty("sprite");
  expect(options?.defaults?.visitOptions).toBe(withVisitHeaders);
});

it("passes the sprite href when the config has a spriteUrl", async () => {
  setConfigScript(JSON.stringify({ spriteUrl: "/vendor/lattice/sprite.svg?v=abc" }));
  vi.resetModules();

  await import("./main");
  await vi.waitFor(() => expect(createLatticeApp).toHaveBeenCalledOnce());

  const options = createLatticeApp.mock.calls[0]?.[0];
  expect(options?.sprite).toEqual({ href: "/vendor/lattice/sprite.svg?v=abc" });
});

it("configures echo before booting the app", async () => {
  setConfigScript(JSON.stringify({ echo: { broadcaster: "reverb" } }));
  vi.resetModules();

  await import("./main");
  await vi.waitFor(() => expect(createLatticeApp).toHaveBeenCalledOnce());

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

  await import("./main");
  await vi.waitFor(() => expect(createLatticeApp).toHaveBeenCalledOnce());

  expect(warn).toHaveBeenCalledOnce();

  warn.mockRestore();
});
