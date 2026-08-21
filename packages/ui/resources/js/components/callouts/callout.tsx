import type { ComponentProps, ReactNode } from "react";
import type { Variant } from "../../generated";
import { Icon } from "../../icons";
import { cn } from "../../lib/utils";
import { variantStyles } from "../../toast/variant-styles";

export type CalloutProps = Omit<ComponentProps<"div">, "title"> & {
  variant: Variant;
  message: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
};

export function Callout({
  variant,
  message,
  title,
  action,
  dismissible = true,
  dismissLabel = "Dismiss",
  onDismiss,
  className,
  ...props
}: CalloutProps) {
  return (
    <div
      role="status"
      data-test={`callout-${variant}`}
      className={cn(
        "flex items-start gap-3 rounded-lt border border-l-4 border-lt-border bg-lt-popover p-4 text-lt-popover-fg",
        variantStyles[variant].accent,
        className,
      )}
      {...props}
    >
      {variantStyles[variant].icon}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {title ? <p className="text-sm font-medium text-lt-fg">{title}</p> : null}
        <p className="text-sm text-lt-fg">{message}</p>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {dismissible ? (
        <button
          type="button"
          aria-label={dismissLabel}
          data-test="callout-dismiss"
          className="shrink-0 rounded-lt-sm p-1 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
          onClick={onDismiss}
        >
          <Icon name="x" className="size-lt-icon-md" />
        </button>
      ) : null}
    </div>
  );
}
