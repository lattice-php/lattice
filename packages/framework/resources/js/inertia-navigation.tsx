import { Link, router } from "@inertiajs/react";
import type { Plugin } from "@lattice-php/core/registry";
import { effectHandler } from "@lattice-php/ui/effects/registry";
import type { NavigationAdapter, NavLinkProps } from "@lattice-php/ui/navigation";

function InertiaLink({ href, method = "get", ...props }: NavLinkProps) {
  return (
    <Link href={href} method={method} {...props}>
      {props.children}
    </Link>
  );
}

export const inertiaNavigation: NavigationAdapter = {
  Link: InertiaLink,
  visit: (url, options) => router.visit(url, options),
  reload: () => router.reload(),
};

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
