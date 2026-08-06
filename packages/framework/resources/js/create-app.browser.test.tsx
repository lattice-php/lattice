import type { Page as InertiaPage } from "@inertiajs/core";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const createInertiaApp = vi.hoisted(() => vi.fn<(options?: unknown) => void>());
const router = vi.hoisted(() => ({
  on: vi.fn<() => () => void>(() => () => {}),
  visit: vi.fn<() => void>(),
}));
const configureI18nFromPageProps = vi.hoisted(() =>
  vi.fn<(props: unknown, options?: unknown) => Promise<void>>(() => Promise.resolve()),
);
vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({
    createInertiaApp,
    router,
  }),
);
vi.mock("@lattice-php/ui/i18n/page-props", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  configureI18nFromPageProps,
}));

import { createLatticeApp } from "./create-app";
import { pageComponentName } from "./inertia";

type CapturedOptions = {
  withApp: (
    node: React.ReactElement,
    context: { ssr: boolean; page: InertiaPage },
  ) => React.ReactElement;
};

afterEach(() => {
  createInertiaApp.mockReset();
  configureI18nFromPageProps.mockClear();
  localStorage.clear();
  document.getElementById("app")?.remove();
});

describe("createLatticeApp hydration", () => {
  it("hydrates server-rendered markup immediately without a mismatch", async () => {
    let resolveConfigure = (): void => {};
    configureI18nFromPageProps.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveConfigure = resolve;
      }),
    );

    const page = {
      component: pageComponentName,
      props: {
        lattice: {
          i18n: {
            enabled: true,
            saveMissing: false,
            locales: ["en", "de"],
            preloadLocales: ["en"],
            timezone: null,
          },
        },
      },
      url: "/",
    } as unknown as InertiaPage;

    createLatticeApp();

    const options = createInertiaApp.mock.calls[0]?.[0] as CapturedOptions;
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

    const root: Root = hydrateRoot(
      el,
      options.withApp(<div data-test="app">hello</div>, { ssr: false, page }),
      { onRecoverableError },
    );

    await expect.poll(() => el.querySelector('[data-test="app"]')?.textContent).toBe("hello");
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(configureI18nFromPageProps).toHaveBeenCalledWith(page.props, {
      namespaces: ["lattice", "lattice-ui"],
    });

    resolveConfigure();
    await new Promise((resolve) => setTimeout(resolve, 0));

    root.unmount();
    consoleError.mockRestore();
  });
});
