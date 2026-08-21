import * as ToastPrimitive from "@radix-ui/react-toast";
import type { ComponentProps, ReactNode } from "react";
import type { Variant } from "../generated";
import { Icon } from "../icons";
import { cn } from "../lib/utils";
import { variantStyles } from "./variant-styles";

export type ToastProps = Omit<ComponentProps<typeof ToastPrimitive.Root>, "title"> & {
  variant: Variant;
  message: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  dismissLabel?: string;
  persistent?: boolean;
};

export function Toast({
  variant,
  message,
  action,
  dismissible = true,
  dismissLabel = "Dismiss",
  persistent = false,
  duration,
  className,
  ...props
}: ToastProps) {
  return (
    <ToastPrimitive.Root
      className={cn(
        "flex items-start gap-3 rounded-lt border border-l-4 border-lt-border bg-lt-popover p-4 text-lt-popover-fg shadow-lt-lg",
        variantStyles[variant].accent,
        "data-[state=open]:animate-lt-toast-in data-[state=closed]:animate-lt-toast-out",
        "data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform",
        className,
      )}
      data-test={`toast-${variant}`}
      duration={persistent ? Infinity : duration}
      {...props}
    >
      {variantStyles[variant].icon}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <ToastPrimitive.Title className="text-sm text-lt-fg">{message}</ToastPrimitive.Title>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {dismissible ? (
        <ToastPrimitive.Close
          aria-label={dismissLabel}
          className="shrink-0 rounded-lt-sm p-1 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
          data-test="toast-dismiss"
        >
          <Icon name="x" className="size-lt-icon-md" />
        </ToastPrimitive.Close>
      ) : null}
    </ToastPrimitive.Root>
  );
}
