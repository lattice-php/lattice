import type { Page as InertiaPage, VisitOptions } from "@inertiajs/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createInertiaApp = vi.hoisted(() => vi.fn<(options?: unknown) => void>());
const router = vi.hoisted(() => ({
  on: vi.fn<() => () => void>(() => () => {}),
  visit: vi.fn<() => void>(),
}));
const configureI18nFromPageProps = vi.hoisted(() =>
  vi.fn<(props: unknown, options?: unknown) => Promise<void>>(() => Promise.resolve()),
);
vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock({
    createInertiaApp,
    router,
  }),
);
vi.mock("./i18n/page-props", () => ({ configureI18nFromPageProps }));

import { useAppearance } from "./appearance";
import { createRegistry } from "./core/registry";
import { createLatticeApp } from "./create-app";
import { pageComponentName } from "./inertia";
import Page from "./page";
import { ProviderBase } from "./provider-base";

type CapturedOptions = {
  resolve: (name: string) => unknown;
  layout: (name: string, page: InertiaPage) => unknown;
  withApp: (node: ReactElement, context: { ssr: boolean; page: InertiaPage }) => ReactElement;
  strictMode: boolean;
  title?: (title: string) => string;
  defaults?: { visitOptions?: (href: string, options: VisitOptions) => VisitOptions };
};

function captureOptions(): CapturedOptions {
  return createInertiaApp.mock.calls[0]?.[0] as CapturedOptions;
}

function fakePage(props: Record<string, unknown> = {}): InertiaPage {
  return { component: pageComponentName, props, url: "/" } as unknown as InertiaPage;
}

const i18nProps = {
  lattice: {
    i18n: {
      enabled: true,
      saveMissing: false,
      locales: ["en", "de"],
      preloadLocales: ["en"],
      timezone: null,
    },
  },
};

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
  configureI18nFromPageProps.mockClear();
  localStorage.clear();
  document.getElementById("app")?.remove();
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
    const registry = createRegistry();

    createLatticeApp({ registry, sprite });

    const wrapped = captureOptions().withApp(<div />, { ssr: false, page: fakePage() });

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

    const wrapped = captureOptions().withApp(<div />, { ssr: false, page: fakePage() });
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

  it("gates the first render on the i18n bootstrap when the backend shares the prop", async () => {
    let resolveConfigure = (): void => {};
    configureI18nFromPageProps.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveConfigure = resolve;
      }),
    );

    createLatticeApp();

    render(
      captureOptions().withApp(<div data-test="app" />, {
        ssr: false,
        page: fakePage(i18nProps),
      }),
    );

    expect(screen.queryByTestId("app")).not.toBeInTheDocument();

    resolveConfigure();
    await waitFor(() => expect(screen.getByTestId("app")).toBeInTheDocument());

    expect(configureI18nFromPageProps).toHaveBeenCalledWith(i18nProps, {});
  });

  it("passes the configured namespaces to the i18n bootstrap", async () => {
    createLatticeApp({ i18n: { namespaces: ["lattice", "app"] } });

    render(
      captureOptions().withApp(<div data-test="app" />, {
        ssr: false,
        page: fakePage(i18nProps),
      }),
    );

    await waitFor(() => expect(screen.getByTestId("app")).toBeInTheDocument());

    expect(configureI18nFromPageProps).toHaveBeenCalledWith(i18nProps, {
      namespaces: ["lattice", "app"],
    });
  });

  it("merges plugin i18n namespaces into the i18n bootstrap", async () => {
    createLatticeApp({
      plugins: [{ name: "tree", i18n: { namespace: "tree" } }],
    });

    render(
      captureOptions().withApp(<div data-test="app" />, {
        ssr: false,
        page: fakePage(i18nProps),
      }),
    );

    await waitFor(() => expect(screen.getByTestId("app")).toBeInTheDocument());

    expect(configureI18nFromPageProps).toHaveBeenCalledWith(i18nProps, {
      namespaces: ["lattice", "tree"],
    });
  });

  it("combines caller namespaces with plugin namespaces without duplicates", async () => {
    createLatticeApp({
      i18n: { namespaces: ["lattice", "app"] },
      plugins: [
        { name: "tree", i18n: { namespace: "tree" } },
        { name: "dup", i18n: { namespace: "app" } },
      ],
    });

    render(
      captureOptions().withApp(<div data-test="app" />, {
        ssr: false,
        page: fakePage(i18nProps),
      }),
    );

    await waitFor(() => expect(screen.getByTestId("app")).toBeInTheDocument());

    expect(configureI18nFromPageProps).toHaveBeenCalledWith(i18nProps, {
      namespaces: ["lattice", "app", "tree"],
    });
  });

  it("renders immediately and skips the i18n chunk when the prop is absent", () => {
    createLatticeApp();

    render(captureOptions().withApp(<div data-test="app" />, { ssr: false, page: fakePage() }));

    expect(screen.getByTestId("app")).toBeInTheDocument();
    expect(configureI18nFromPageProps).not.toHaveBeenCalled();
  });

  it("composes the locale visit headers into the caller's visitOptions", () => {
    const userVisitOptions = vi.fn<(href: string, options: VisitOptions) => VisitOptions>(
      (_href, options) => ({ ...options, headers: { ...options.headers, "X-App": "1" } }),
    );

    createLatticeApp({ defaults: { visitOptions: userVisitOptions } });

    const visitOptions = captureOptions().defaults?.visitOptions;
    const composed = visitOptions?.("/dashboard", { headers: {} } as VisitOptions);

    expect(userVisitOptions).toHaveBeenCalled();
    expect(composed?.headers).toMatchObject({ "X-App": "1" });
    expect(composed?.headers).toHaveProperty("Accept-Language");
  });

  it("opts out of i18n entirely with i18n: false", () => {
    const userDefaults = { visitOptions: undefined };

    createLatticeApp({ i18n: false, defaults: userDefaults });

    expect(captureOptions().defaults).toBe(userDefaults);

    render(
      captureOptions().withApp(<div data-test="app" />, {
        ssr: false,
        page: fakePage(i18nProps),
      }),
    );

    expect(screen.getByTestId("app")).toBeInTheDocument();
    expect(configureI18nFromPageProps).not.toHaveBeenCalled();
  });

  it("runs the boot hook with the initial page and gates the render until it resolves", async () => {
    let resolveBoot = (): void => {};
    const boot = vi.fn<(context: { page: InertiaPage }) => Promise<void>>(
      () =>
        new Promise<void>((resolve) => {
          resolveBoot = resolve;
        }),
    );
    const page = fakePage({ reverb: { host: "localhost" } });

    createLatticeApp({ boot });

    render(captureOptions().withApp(<div data-test="app" />, { ssr: false, page }));

    expect(boot).toHaveBeenCalledWith({ page });
    expect(screen.queryByTestId("app")).not.toBeInTheDocument();

    resolveBoot();
    await waitFor(() => expect(screen.getByTestId("app")).toBeInTheDocument());
  });

  it("hydrates server-rendered markup immediately without a mismatch", async () => {
    let resolveConfigure = (): void => {};
    configureI18nFromPageProps.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveConfigure = resolve;
      }),
    );

    const page = fakePage(i18nProps);

    createLatticeApp();

    const options = captureOptions();
    const html = renderToString(
      options.withApp(<div data-test="app">hello</div>, { ssr: true, page }),
    );

    const el = document.createElement("div");
    el.id = "app";
    el.setAttribute("data-server-rendered", "true");
    el.innerHTML = html;
    document.body.append(el);

    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(
        el,
        options.withApp(<div data-test="app">hello</div>, { ssr: false, page }),
        { onRecoverableError },
      );
    });

    expect(screen.getByTestId("app")).toHaveTextContent("hello");
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(configureI18nFromPageProps).toHaveBeenCalledWith(i18nProps, {});

    resolveConfigure();
    await act(async () => {});

    root?.unmount();
    consoleError.mockRestore();
  });

  it("seeds the server-rendered appearance from the shared prop", () => {
    function Probe() {
      return <span>{useAppearance().appearance}</span>;
    }

    createLatticeApp();

    const html = renderToString(
      captureOptions().withApp(<Probe />, {
        ssr: true,
        page: fakePage({ lattice: { appearance: "dark" } }),
      }),
    );

    expect(html).toContain("dark");
  });

  it("skips boot and the i18n bootstrap on the server render", () => {
    const boot = vi.fn<() => void>();

    createLatticeApp({ boot });

    captureOptions().withApp(<div />, { ssr: true, page: fakePage(i18nProps) });

    expect(boot).not.toHaveBeenCalled();
    expect(configureI18nFromPageProps).not.toHaveBeenCalled();
  });

  it("composes wrap around the app inside the Provider", () => {
    createLatticeApp({
      wrap: (app) => <section data-test="shell">{app}</section>,
    });

    render(captureOptions().withApp(<div data-test="app" />, { ssr: false, page: fakePage() }));

    expect(screen.getByTestId("shell")).toBeInTheDocument();
    expect(screen.getByTestId("app")).toBeInTheDocument();
  });
});
