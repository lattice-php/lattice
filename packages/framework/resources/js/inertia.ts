import type { Page as InertiaPage, VisitOptions } from "@inertiajs/core";
import { http, type ResolvedComponent } from "@inertiajs/react";
import { LATTICE_REF_HEADER, latestRef } from "@lattice-php/core/component-ref";
import { withHeaders } from "@lattice-php/core/headers";
import { SchemaLayout } from "./layout";
import Page from "./page";
import type { PagePayload } from "./types";

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

    const resolvedPage = pages[`./Pages/${name}.tsx`] ?? pages[`./pages/${name}.tsx`];

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

export function withVisitHeaders(_href: string, options: VisitOptions): VisitOptions {
  return {
    ...options,
    headers: withHeaders("", options.headers),
  };
}

let refRenewalRegistered = false;

/**
 * Resolve the outgoing X-Lattice-Ref header through the renewed-token map at
 * request time. Component props bake the originally sealed ref into headers at
 * render time, so without this rewrite an Inertia request fired between a
 * renewal and the next re-render would still carry the expired token.
 */
export function registerRefRenewal(): void {
  if (refRenewalRegistered) {
    return;
  }

  refRenewalRegistered = true;

  http.onRequest((config) => {
    const sealed = config.headers?.[LATTICE_REF_HEADER];

    if (config.headers && typeof sealed === "string" && sealed !== "") {
      config.headers[LATTICE_REF_HEADER] = latestRef(sealed);
    }

    return config;
  });
}
