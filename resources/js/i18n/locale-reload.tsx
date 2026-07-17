import type { VisitOptions } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { useWindowEvent } from "@lattice-php/lattice/core/hooks/use-window-event";

type LocaleReloadProps = Pick<VisitOptions, "preserveScroll" | "preserveState">;

// preserveState by default: the visit only re-fetches the re-localized props,
// so keeping the page mounted avoids remounting the whole tree (and losing
// table sort/filter, form input, focus) on every locale switch.
export function LocaleReload({ preserveScroll = true, preserveState = true }: LocaleReloadProps) {
  useWindowEvent(LATTICE_EVENT.localeChange, (event) => {
    const locale = (event as CustomEvent<{ locale?: unknown }>).detail?.locale;

    if (typeof locale === "string" && locale !== "") {
      router.visit(window.location.href, { preserveScroll, preserveState });
    }
  });

  return null;
}
