import type { Page as InertiaPage } from "@inertiajs/core";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createInertiaApp = vi.hoisted(() => vi.fn<(options?: unknown) => void>());

vi.mock("@inertiajs/react", () => ({ createInertiaApp }));

import { createLatticeApp } from "./create-app";
import { pageComponentName } from "./inertia";
import Page from "./page";
import { ProviderBase } from "./provider-base";

type CapturedOptions = {
  resolve: (name: string) => unknown;
  layout: (name: string, page: InertiaPage) => unknown;
  withApp: (node: ReactElement) => ReactElement;
  strictMode: boolean;
  title?: (title: string) => string;
};

function captureOptions(): CapturedOptions {
  return createInertiaApp.mock.calls[0]?.[0] as CapturedOptions;
}

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn<(query: string) => MediaQueryList>(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn<() => void>(),
          removeEventListener: vi.fn<() => void>(),
        }) as unknown as MediaQueryList,
    ),
  );
});

afterEach(() => {
  createInertiaApp.mockReset();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("createLatticeApp", () => {
  it("resolves server-driven lattice pages", () => {
    createLatticeApp();

    expect(captureOptions().resolve(pageComponentName)).toEqual({ default: Page });
  });

  it("resolves normal inertia pages from the provided glob", async () => {
    const Dashboard = (): null => null;

    createLatticeApp({
      pages: { "./pages/Dashboard.tsx": () => Promise.resolve(Dashboard) },
    });

    await expect(captureOptions().resolve("Dashboard")).resolves.toBe(Dashboard);
  });

  it("wraps the app in the Provider so toasts use Lattice's own Toaster", () => {
    const sprite = { href: "/sprite.svg" };
    const registry = { columns: {}, components: {}, effects: {} };

    createLatticeApp({ registry, sprite });

    const wrapped = captureOptions().withApp(<div />);

    expect(wrapped.type).toBe(ProviderBase);
    expect((wrapped.props as { registry: unknown }).registry).toBe(registry);
    expect((wrapped.props as { sprite: unknown }).sprite).toBe(sprite);
  });

  it("merges component-package plugins onto the registry", () => {
    const Widget = (): null => null;

    createLatticeApp({
      plugins: [
        { name: "acme", components: { "acme.widget": { component: Widget, mode: "eager" } } },
      ],
    });

    const wrapped = captureOptions().withApp(<div />);
    const registry = (wrapped.props as { registry: { components: Record<string, unknown> } })
      .registry;

    expect(registry.components["acme.widget"]).toBeDefined();
  });

  it("defaults strictMode on and forwards other inertia options", () => {
    const title = (value: string): string => value;

    createLatticeApp({ title });

    const options = captureOptions();

    expect(options.strictMode).toBe(true);
    expect(options.title).toBe(title);
  });

  it("initializes the theme", () => {
    createLatticeApp();

    expect(localStorage.getItem("appearance")).toBe("system");
  });
});
