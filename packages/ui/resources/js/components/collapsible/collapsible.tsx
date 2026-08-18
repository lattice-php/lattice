import { useId } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Icon } from "../../icons";
import { InfoTooltip } from "../../info-tooltip";
import { cn } from "../../lib/utils";
import { useCollapsibleState } from "../../lib/use-collapsible-state";

export type CollapsibleTriggerProps = Omit<
  ComponentProps<"div">,
  "aria-controls" | "aria-expanded" | "children" | "role" | "tabIndex"
> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

export type CollapsibleProps = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  storageKey?: string;
  tooltip?: string | null;
  trigger: ReactNode;
  triggerProps?: CollapsibleTriggerProps;
};

export function Collapsible({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  storageKey,
  tooltip,
  trigger,
  triggerProps,
  ...props
}: CollapsibleProps) {
  const contentId = useId();
  const [uncontrolledOpen, toggleUncontrolledOpen] = useCollapsibleState(
    storageKey ?? "",
    defaultOpen ?? false,
    open === undefined && storageKey !== undefined,
  );
  const isOpen = open ?? uncontrolledOpen;
  const {
    className: triggerClassName,
    onClick: onTriggerClick,
    onKeyDown: onTriggerKeyDown,
    ...restTriggerProps
  } = triggerProps ?? {};

  function setOpen(nextOpen: boolean): void {
    if (open === undefined && nextOpen !== uncontrolledOpen) {
      toggleUncontrolledOpen();
    }

    onOpenChange?.(nextOpen);
  }

  function handleTriggerClick(event: MouseEvent<HTMLDivElement>): void {
    onTriggerClick?.(event);

    if (event.defaultPrevented || isInteractiveChild(event.target, event.currentTarget)) {
      return;
    }

    setOpen(!isOpen);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    onTriggerKeyDown?.(event);

    if (event.defaultPrevented || event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(!isOpen);
    }
  }

  return (
    <div
      data-slot="collapsible"
      data-state={isOpen ? "open" : "closed"}
      className={className}
      {...props}
    >
      <div
        {...restTriggerProps}
        aria-controls={contentId}
        aria-expanded={isOpen}
        data-slot="collapsible-trigger"
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-lt-sm py-2 text-left text-lt-fg transition-colors select-none hover:bg-lt-muted focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 focus-visible:outline-none",
          triggerClassName,
        )}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {trigger}
          {tooltip ? <InfoTooltip content={tooltip} /> : null}
        </div>
        <Icon
          name="chevron-down"
          className={cn(
            "size-lt-icon-md shrink-0 text-lt-muted-fg transition-transform motion-reduce:transition-none",
            !isOpen && "-rotate-90",
          )}
        />
      </div>

      {isOpen && children !== null && children !== undefined ? (
        <div id={contentId} data-slot="collapsible-content" className="flex flex-col gap-4 pt-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function isInteractiveChild(target: EventTarget, trigger: HTMLDivElement): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const interactiveElement = target.closest(
    'a[href], button, input, select, textarea, [contenteditable="true"], [role="button"]',
  );

  return interactiveElement !== null && interactiveElement !== trigger;
}
