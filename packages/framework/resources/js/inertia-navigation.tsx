import { Link, router } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import type { Plugin } from "@lattice-php/core/registry";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { effectHandler } from "@lattice-php/ui/effects/registry";
import type { NavigationAdapter, NavLinkProps } from "@lattice-php/ui/navigation";
import type { ComponentProps } from "react";

function InertiaLink({ href, method = "get", children, ...props }: NavLinkProps) {
  // NavLinkProps types handlers against HTMLAnchorElement; Inertia's Link
  // types them against Element. Same events at runtime, so the cast only
  // bridges React's generic variance.
  return (
    <Link href={href} method={method} {...(props as ComponentProps<typeof Link>)}>
      {children}
    </Link>
  );
}

function onNavigate(listener: () => void): () => void {
  return router.on("navigate", listener);
}

export const inertiaNavigation: NavigationAdapter = {
  Link: InertiaLink,
  visit: (url, options) => router.visit(url, options),
  reload: () => router.reload(),
  onNavigate,
};

function pathOf(url: string): string {
  return url.split(/[?#]/, 1)[0] ?? url;
}

function initialPath(initialUrl: string | undefined): string | undefined {
  if (initialUrl !== undefined) {
    return pathOf(initialUrl);
  }

  return typeof window === "undefined" ? undefined : window.location.pathname;
}

/**
 * The Inertia-backed navigation adapter with a live `currentUrl`. The provider
 * mounts outside Inertia's page context, so the url is seeded from the initial
 * page and then tracked through the router's `navigate` event.
 */
export function useInertiaNavigation(initialUrl?: string): NavigationAdapter {
  const [currentUrl, setCurrentUrl] = useState(() => initialPath(initialUrl));

  useEffect(
    () => router.on("navigate", (event) => setCurrentUrl(pathOf(event.detail.page.url))),
    [],
  );

  return useMemo(() => ({ ...inertiaNavigation, currentUrl }), [currentUrl]);
}

function closeAllModals(): void {
  window.dispatchEvent(new CustomEvent(LATTICE_EVENT.closeModal, { detail: { modal: null } }));
}

/**
 * An open modal must not survive the page it was opened on — its content can
 * hold stale props once the visit swaps in a new page. Inertia's `navigate`
 * event only fires for a visit that actually swaps in a different page
 * (a new URL, or history back/forward); a same-URL visit — `router.reload()`,
 * partial reloads, polling — is internally marked as a `replace` and never
 * fires it. Subscribing to `navigate` alone is therefore already the correct
 * discriminator: a modal open during a same-page refresh is left untouched.
 */
export function useCloseModalsOnNavigate(): void {
  useEffect(() => router.on("navigate", closeAllModals), []);
}

/**
 * SPA-grade redirect/reload effect handlers. Registered as an effects
 * extension so they override ui's window-based built-ins wherever the
 * framework registry is active.
 */
export const navigationPlugin: Plugin = {
  name: "lattice/navigation",
  extensions: {
    effects: {
      redirect: effectHandler("redirect", (effect) => router.visit(effect.props.url)),
      "reload-page": effectHandler("reload-page", (effect) =>
        effect.props.full ? window.location.reload() : router.reload(),
      ),
    },
  },
};
