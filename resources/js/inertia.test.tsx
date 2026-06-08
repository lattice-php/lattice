import type { Page as InertiaPage } from "@inertiajs/core";
import type { ResolvedComponent } from "@inertiajs/react";
import { describe, expect, it, vi } from "vitest";
import { createLayoutResolver, createPageResolver } from "./inertia";
import Page from "./page";
import type { PagePayload } from "./core/types";

function pageWithLattice(lattice: PagePayload): InertiaPage {
  return {
    component: "lattice/page",
    flash: {},
    props: {
      errors: {},
      lattice,
    },
    rememberedState: {},
    rescuedProps: [],
    url: "/",
    version: null,
  };
}

function payload(lattice: Partial<PagePayload> = {}): PagePayload {
  return {
    breadcrumbs: [],
    components: [],
    container: "default",
    layout: "none",
    menus: {},
    title: "Lattice",
    ...lattice,
  };
}

describe("createPageResolver", () => {
  it("resolves the package lattice page", () => {
    const resolver = createPageResolver({});

    expect(resolver("lattice/page")).toEqual({ default: Page });
  });

  it("resolves app pages from the provided modules", async () => {
    const component = (() => null) satisfies ResolvedComponent;
    const page = vi.fn<() => Promise<ResolvedComponent>>(() => Promise.resolve(component));
    const resolver = createPageResolver({
      "./pages/dashboard.tsx": page,
    });

    await expect(resolver("dashboard")).resolves.toBe(component);
  });

  it("throws for unknown pages", () => {
    const resolver = createPageResolver({});

    expect(() => resolver("missing")).toThrow("Page not found: missing");
  });
});

describe("createLayoutResolver", () => {
  it("maps app lattice pages to the configured app layout with breadcrumbs", () => {
    const app = Symbol("app");
    const auth = Symbol("auth");
    const resolver = createLayoutResolver({ layouts: { app, auth } });
    const breadcrumbs = [{ href: "/dashboard", title: "Dashboard" }];

    expect(
      resolver(
        "lattice/page",
        pageWithLattice(
          payload({
            breadcrumbs,
            layout: "app",
          }),
        ),
      ),
    ).toEqual([app, { breadcrumbs }]);
  });

  it("maps auth lattice pages to the configured auth layout", () => {
    const app = Symbol("app");
    const auth = Symbol("auth");
    const resolver = createLayoutResolver({ layouts: { app, auth } });

    expect(
      resolver(
        "lattice/page",
        pageWithLattice(
          payload({
            layout: "auth",
          }),
        ),
      ),
    ).toBe(auth);
  });

  it("delegates non-lattice pages to the default layout resolver", () => {
    const defaultLayout = vi.fn<(name: string, page: InertiaPage) => string>(
      () => "default-layout",
    );
    const resolver = createLayoutResolver({
      defaultLayout,
      layouts: {
        app: "app-layout",
        auth: "auth-layout",
      },
    });
    const page = pageWithLattice(payload());

    expect(resolver("auth/login", page)).toBe("default-layout");
    expect(defaultLayout).toHaveBeenCalledWith("auth/login", page);
  });
});
