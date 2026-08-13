import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
import { useNavigation, type NavigationVisitOptions } from "../navigation";

// preserveState by default: the visit only re-fetches the re-localized props,
// so keeping the page mounted avoids remounting the whole tree (and losing
// table sort/filter, form input, focus) on every locale switch.
export function LocaleReload({
  preserveScroll = true,
  preserveState = true,
}: NavigationVisitOptions) {
  const { visit } = useNavigation();

  useWindowEvent(LATTICE_EVENT.localeChange, (event) => {
    const locale = (event as CustomEvent<{ locale?: unknown }>).detail?.locale;

    if (typeof locale === "string" && locale !== "") {
      visit(window.location.href, { preserveScroll, preserveState });
    }
  });

  return null;
}
