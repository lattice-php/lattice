import * as ToastPrimitive from "@radix-ui/react-toast";
import type { ComponentProps, ReactNode } from "react";
import type { Variant } from "../generated";
import { Icon } from "../icons";
import { cn } from "../lib/utils";
import {
  toastActionsClassName,
  toastBodyClassName,
  toastCardClassName,
  toastDismissClassName,
  toastMessageClassName,
} from "./toast-card";
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
        toastCardClassName(variant),
        "data-[state=open]:animate-lt-toast-in data-[state=closed]:animate-lt-toast-out",
        "data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform",
        className,
      )}
      data-test={`toast-${variant}`}
      duration={persistent ? Infinity : duration}
      {...props}
    >
      {variantStyles[variant].icon}
      <div className={toastBodyClassName}>
        <ToastPrimitive.Title className={toastMessageClassName}>{message}</ToastPrimitive.Title>
        {action ? <div className={toastActionsClassName}>{action}</div> : null}
      </div>
      {dismissible ? (
        <ToastPrimitive.Close
          aria-label={dismissLabel}
          className={toastDismissClassName}
          data-test="toast-dismiss"
        >
          <Icon name="x" className="size-lt-icon-md" />
        </ToastPrimitive.Close>
      ) : null}
    </ToastPrimitive.Root>
  );
}
