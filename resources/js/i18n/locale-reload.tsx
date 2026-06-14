import type { VisitOptions } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import { useCallback } from "react";
import { EventBridge } from "../events/event-bridge";

export type LocaleReloadProps = Pick<VisitOptions, "preserveScroll" | "preserveState">;

export function LocaleReload({ preserveScroll = true, preserveState = false }: LocaleReloadProps) {
  const reload = useCallback(() => {
    router.visit(window.location.href, { preserveScroll, preserveState });
  }, [preserveScroll, preserveState]);

  return <EventBridge onLocaleChange={reload} />;
}
