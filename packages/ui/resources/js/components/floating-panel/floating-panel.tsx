import { useState } from "react";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/utils";

export type FloatingPanelPlacement = "bottom-end" | "bottom-start" | "top-end" | "top-start";

export type FloatingPanelTriggerProps = Omit<
  ComponentProps<"button">,
  "aria-expanded" | "children" | "type"
> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

export type FloatingPanelProps = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode;
  defaultOpen?: boolean;
  offset?: number;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placement?: FloatingPanelPlacement;
  trigger?: ReactNode;
  triggerProps?: FloatingPanelTriggerProps;
};

export function FloatingPanel({
  "aria-label": ariaLabel,
  children,
  className,
  defaultOpen = false,
  offset = 16,
  onOpenChange,
  open,
  placement = "bottom-end",
  role,
  style,
  trigger,
  triggerProps,
  ...props
}: FloatingPanelProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const {
    className: triggerClassName,
    onClick: onTriggerClick,
    ...restTriggerProps
  } = triggerProps ?? {};
  const position = placementStyle(placement, Math.max(0, offset));

  if (trigger === null || trigger === undefined) {
    return (
      <div
        aria-label={ariaLabel}
        className={cn(
          "fixed z-lt-popover max-w-[calc(100vw-2rem)] rounded-lt border border-lt-border bg-lt-popover p-1 text-lt-popover-fg shadow-lt-md",
          className,
        )}
        role={ariaLabel ? (role ?? "group") : role}
        {...props}
        style={{ ...position, ...style }}
      >
        {children}
      </div>
    );
  }

  const expandsUpward = placement === "bottom-start" || placement === "bottom-end";
  const anchorsToStart = placement === "top-start" || placement === "bottom-start";

  function handleTriggerClick(event: MouseEvent<HTMLButtonElement>): void {
    onTriggerClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const nextOpen = !isOpen;

    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn("fixed z-lt-popover max-w-[calc(100vw-2rem)]", className)}
      role={ariaLabel ? (role ?? "group") : role}
      {...props}
      style={{ ...position, ...style }}
    >
      <div className={cn("flex w-fit gap-2", expandsUpward ? "flex-col-reverse" : "flex-col")}>
        <button
          {...restTriggerProps}
          aria-expanded={isOpen}
          className={cn(
            "inline-flex items-center gap-2 rounded-lt border border-lt-border bg-lt-popover px-3 py-1.5 text-sm font-medium text-lt-popover-fg shadow-lt-md hover:bg-lt-muted",
            anchorsToStart ? "self-start" : "self-end",
            triggerClassName,
          )}
          onClick={handleTriggerClick}
          type="button"
        >
          {trigger}
        </button>
        <div className={isOpen ? "block" : "hidden"}>{children}</div>
      </div>
    </div>
  );
}

function placementStyle(placement: FloatingPanelPlacement, offset: number): CSSProperties {
  if (placement === "top-start") {
    return { left: offset, top: offset };
  }

  if (placement === "top-end") {
    return { right: offset, top: offset };
  }

  if (placement === "bottom-start") {
    return { bottom: offset, left: offset };
  }

  return { bottom: offset, right: offset };
}
