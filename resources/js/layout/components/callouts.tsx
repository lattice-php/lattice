import { Icon } from "@lattice-php/lattice/icons";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import type { Callout } from "@lattice-php/lattice/types/generated";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { onCallout, onRetractCallout } from "@lattice-php/lattice/toast";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import { resolveText } from "@lattice-php/lattice/i18n/translatable";
import { variantStyles } from "@lattice-php/lattice/toast";

type CalloutItem = Callout & { id: number };

let nextId = 0;

/**
 * Renders callouts emitted on the bus. A keyed callout is a projection of
 * server state: it replaces any callout sharing its key, and is dropped when
 * `navigate` fires. Inertia only fires `navigate` for a URL-changing visit
 * (initial load included); a same-URL visit — `router.reload()`,
 * `redirect()->back()` to the same URL, polling, partial reloads — sets
 * `replace` instead and never fires it, so the callout survives until the
 * server overwrites or drops it. On these URL-changing visits, `navigate`
 * fires before `flash`, so re-assertion always wins over the clear and no
 * ordering guard is needed. A `retract-callout` effect clears one on a
 * same-URL response too.
 */
const Callouts: RendererComponent<"callouts"> = () => {
  const { t } = useT("lattice");
  const [callouts, setCallouts] = useState<CalloutItem[]>([]);

  useEffect(
    () =>
      onCallout((callout) => {
        setCallouts((current) => {
          const kept = callout.unique
            ? current.filter((existing) => existing.unique !== callout.unique)
            : current;

          return [...kept, { ...callout, id: nextId++ }];
        });
      }),
    [],
  );

  useEffect(
    () =>
      router.on("navigate", () => {
        setCallouts((current) => current.filter((callout) => !callout.unique));
      }),
    [],
  );

  useEffect(
    () =>
      onRetractCallout((unique) => {
        setCallouts((current) => current.filter((callout) => callout.unique !== unique));
      }),
    [],
  );

  function dismiss(id: number): void {
    setCallouts((current) => current.filter((callout) => callout.id !== id));
  }

  if (callouts.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {callouts.map((callout) => (
        <div
          key={callout.id}
          role="status"
          data-test={`callout-${callout.variant}`}
          className={cn(
            "flex items-start gap-3 rounded-lt border border-l-4 border-lt-border bg-lt-popover p-4 text-lt-popover-fg",
            variantStyles[callout.variant].accent,
          )}
        >
          {variantStyles[callout.variant].icon}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {callout.title ? (
              <p className="text-sm font-medium text-lt-fg">{resolveText(callout.title, t)}</p>
            ) : null}
            <p className="text-sm text-lt-fg">{resolveText(callout.message, t)}</p>
            {callout.action ? (
              <div className="flex flex-wrap gap-2">
                <RenderNode node={callout.action} />
              </div>
            ) : null}
          </div>
          {callout.dismissible ? (
            <button
              type="button"
              aria-label={t("common.dismiss", "Dismiss")}
              data-test="callout-dismiss"
              className="shrink-0 rounded-lt-sm p-1 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
              onClick={() => dismiss(callout.id)}
            >
              <Icon name="x" className="size-lt-icon-md" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default Callouts;
