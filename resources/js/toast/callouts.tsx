import { Icon } from "@lattice-php/lattice/icons";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Renderer, useRendererContext } from "@lattice-php/lattice/core/renderer";
import type { Callout, Variant } from "@lattice-php/lattice/types/generated";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { onCallout } from "@lattice-php/lattice/toast/callout";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";

type CalloutItem = Callout & { id: number };

const accents: Record<Variant, { accent: string; icon: ReactNode }> = {
  success: {
    accent: "border-l-lt-success",
    icon: <Icon name="circle-check" className="size-lt-icon-lg shrink-0 text-lt-success" />,
  },
  info: {
    accent: "border-l-lt-info",
    icon: <Icon name="info" className="size-lt-icon-lg shrink-0 text-lt-info" />,
  },
  warning: {
    accent: "border-l-lt-warning",
    icon: <Icon name="circle-alert" className="size-lt-icon-lg shrink-0 text-lt-warning" />,
  },
  error: {
    accent: "border-l-lt-danger",
    icon: <Icon name="circle-x" className="size-lt-icon-lg shrink-0 text-lt-danger" />,
  },
};

let nextId = 0;

const Callouts: RendererComponent<"callouts"> = () => {
  const { t } = useT("lattice");
  const { registry } = useRendererContext();
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
            accents[callout.variant].accent,
          )}
        >
          {accents[callout.variant].icon}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {callout.title ? (
              <p className="text-sm font-medium text-lt-fg">{callout.title}</p>
            ) : null}
            <p className="text-sm text-lt-fg">{callout.message}</p>
            {callout.action ? (
              <div className="flex flex-wrap gap-2">
                <Renderer nodes={[callout.action]} registry={registry} />
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
