import type { ComponentProps, ReactNode } from "react";
import type { Variant } from "../generated";
import { Icon } from "../icons";
import { cn } from "../lib/utils";
import { variantStyles } from "./variant-styles";

export const toastBodyClassName = "flex min-w-0 flex-1 flex-col gap-2";

export const toastMessageClassName = "text-sm text-lt-fg";

export const toastActionsClassName = "flex flex-wrap gap-2";

export const toastDismissClassName =
  "shrink-0 rounded-lt-sm p-1 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg";

export function toastCardClassName(variant: Variant, className?: string): string {
  return cn(
    "flex items-start gap-3 rounded-lt border border-l-4 border-lt-border bg-lt-popover p-4 text-lt-popover-fg shadow-lt-lg",
    variantStyles[variant].accent,
    className,
  );
}

export type ToastCardProps = ComponentProps<"div"> & {
  variant: Variant;
  message: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
};

/**
 * The presentational toast markup without the Radix toast machinery: renders
 * anywhere (previews, docs, static captures) — no provider, viewport, or
 * portal required. `Toaster`/`Toast` remain the live notification pipeline.
 */
export function ToastCard({
  variant,
  message,
  action,
  dismissible = false,
  dismissLabel = "Dismiss",
  onDismiss,
  className,
  ...props
}: ToastCardProps) {
  return (
    <div
      className={toastCardClassName(variant, className)}
      data-test={`toast-${variant}`}
      {...props}
    >
      {variantStyles[variant].icon}
      <div className={toastBodyClassName}>
        <div className={toastMessageClassName}>{message}</div>
        {action ? <div className={toastActionsClassName}>{action}</div> : null}
      </div>
      {dismissible ? (
        <button
          aria-label={dismissLabel}
          className={toastDismissClassName}
          data-test="toast-dismiss"
          onClick={onDismiss}
          type="button"
        >
          <Icon name="x" className="size-lt-icon-md" />
        </button>
      ) : null}
    </div>
  );
}
