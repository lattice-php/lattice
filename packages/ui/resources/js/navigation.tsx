import { createContext, useContext } from "react";
import type { ComponentPropsWithRef, ComponentType, ReactNode } from "react";
import type { HttpMethod } from "./generated";

export type NavLinkProps = Omit<ComponentPropsWithRef<"a">, "href"> & {
  href: string;
  /** Non-GET methods need an adapter (e.g. Inertia); the default anchor always GETs. */
  method?: HttpMethod;
};

export type NavigationVisitOptions = {
  preserveScroll?: boolean;
  preserveState?: boolean;
};

export type NavigationAdapter = {
  Link: ComponentType<NavLinkProps>;
  visit: (url: string, options?: NavigationVisitOptions) => void;
  reload: () => void;
};

const warnedMethodHrefs = new Set<string>();

function AnchorLink({ href, method, ...props }: NavLinkProps) {
  if (import.meta.env.DEV && method && method !== "get" && !warnedMethodHrefs.has(href)) {
    warnedMethodHrefs.add(href);
    console.warn(
      `[Lattice] Link to "${href}" declares method "${method}", but without a NavigationProvider plain anchors always navigate with GET.`,
    );
  }

  return <a href={href} {...props} />;
}

export const defaultNavigation: NavigationAdapter = {
  Link: AnchorLink,
  visit: (url) => window.location.assign(url),
  reload: () => window.location.reload(),
};

const NavigationContext = createContext<NavigationAdapter>(defaultNavigation);

/**
 * Seeds how links and programmatic visits navigate for everything below it.
 * Without a provider, links render as plain anchors and visits are full page
 * loads; the Lattice runtime seeds an Inertia-backed adapter for SPA
 * navigation.
 */
export function NavigationProvider({
  adapter,
  children,
}: {
  adapter: NavigationAdapter;
  children: ReactNode;
}) {
  return <NavigationContext.Provider value={adapter}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationAdapter {
  return useContext(NavigationContext);
}
