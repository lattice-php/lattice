import { Icon } from "@lattice-php/lattice/icons";
import { useEffect, useState } from "react";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import type { Callout } from "@lattice-php/lattice/types/generated";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { onCallout } from "@lattice-php/lattice/toast/callout";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import { variantStyles } from "@lattice-php/lattice/toast/variant-styles";

type CalloutItem = Callout & { id: number };

let nextId = 0;

const Callouts: RendererComponent<"callouts"> = () => {
  const { t } = useT("lattice");
  const [callouts, setCallouts] = useState<CalloutItem[]>([]);

  useEffect(
    () =>
      onCallout((callout) => {
        setCallouts((current) => [...current, { ...callout, id: nextId++ }]);
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
              <p className="text-sm font-medium text-lt-fg">{callout.title}</p>
            ) : null}
            <p className="text-sm text-lt-fg">{callout.message}</p>
            {callout.action ? (
              <div className="flex flex-wrap gap-2">
                <RenderNode node={callout.action} />
              </div>
            ) : null}
          </div>
          {callout.dismissible ? (
            <button
              type="button"
              aria-label={t("a11y.dismiss", "Dismiss")}
              data-test="callout-dismiss"
              className="shrink-0 rounded-md p-1 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
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
