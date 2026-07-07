import type { VisitOptions } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import { useCallback } from "react";
import { EventBridge } from "../events/event-bridge";

type LocaleReloadProps = Pick<VisitOptions, "preserveScroll" | "preserveState">;

// preserveState by default: the visit only re-fetches the re-localized props,
// so keeping the page mounted avoids remounting the whole tree (and losing
// table sort/filter, form input, focus) on every locale switch.
export function LocaleReload({ preserveScroll = true, preserveState = true }: LocaleReloadProps) {
  const reload = useCallback(() => {
    router.visit(window.location.href, { preserveScroll, preserveState });
  }, [preserveScroll, preserveState]);

  return <EventBridge onLocaleChange={reload} />;
}
