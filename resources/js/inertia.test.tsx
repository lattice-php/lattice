import type { Page as InertiaPage } from "@inertiajs/core";
import type { ResolvedComponent } from "@inertiajs/react";
import { describe, expect, it, vi } from "vitest";
import { createLayoutResolver, createPageResolver } from "./inertia";
import { SchemaLayout } from "./layout";
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
    schema: [],
    container: "default",
    layout: null,
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
  it("renders lattice pages with a layout through the schema layout", () => {
    const resolver = createLayoutResolver();

    expect(
      resolver(
        "lattice/page",
        pageWithLattice(
          payload({
            layout: { key: "app", schema: [] },
          }),
        ),
      ),
    ).toBe(SchemaLayout);
  });

  it("renders layout-less lattice pages standalone", () => {
    const resolver = createLayoutResolver();

    expect(resolver("lattice/page", pageWithLattice(payload()))).toBeNull();
  });

  it("delegates non-lattice pages to the default layout resolver", () => {
    const defaultLayout = vi.fn<(name: string, page: InertiaPage) => string>(
      () => "default-layout",
    );
    const resolver = createLayoutResolver({ defaultLayout });
    const page = pageWithLattice(payload());

    expect(resolver("auth/login", page)).toBe("default-layout");
    expect(defaultLayout).toHaveBeenCalledWith("auth/login", page);
  });

  it("returns null for non-lattice pages without a default resolver", () => {
    const resolver = createLayoutResolver();

    expect(resolver("auth/login", pageWithLattice(payload()))).toBeNull();
  });
});
