import type { Page as InertiaPage } from "@inertiajs/core";
import type { ResolvedComponent } from "@inertiajs/react";
import { SchemaLayout } from "./layout";
import Page from "./page";
import type { PagePayload } from "./core/types";

export const pageComponentName = "lattice/page";

export type ResolvedPage =
  | ResolvedComponent
  | Promise<ResolvedComponent>
  | { default: ResolvedComponent };
export type PageModules = Record<string, () => Promise<ResolvedComponent>>;

export type CreateLayoutResolverOptions = {
  defaultLayout?: (name: string, page: InertiaPage) => unknown;
};

export function createPageResolver(pages: PageModules) {
  return (name: string): ResolvedPage => {
    if (name === pageComponentName) {
      return { default: Page };
    }

    const resolvedPage = pages[`./pages/${name}.tsx`];

    if (resolvedPage) {
      return resolvedPage();
    }

    throw new Error(`Page not found: ${name}`);
  };
}

export function createLayoutResolver({ defaultLayout }: CreateLayoutResolverOptions = {}) {
  return (name: string, page: InertiaPage): unknown => {
    if (name === pageComponentName) {
      const lattice = page.props.lattice as PagePayload | undefined;

      return lattice?.layout ? SchemaLayout : null;
    }

    return defaultLayout?.(name, page) ?? null;
  };
}
