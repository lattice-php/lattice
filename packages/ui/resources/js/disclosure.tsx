import { useId, useState } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Icon } from "./icons";
import { cn } from "./lib/utils";

export type DisclosureSummaryProps = Omit<
  ComponentProps<"div">,
  "aria-controls" | "aria-expanded" | "children" | "role" | "tabIndex"
> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

export type DisclosureProps = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  summary: ReactNode;
  summaryProps?: DisclosureSummaryProps;
};

export function Disclosure({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  summary,
  summaryProps,
  ...props
}: DisclosureProps) {
  const contentId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;
  const {
    className: summaryClassName,
    onClick: onSummaryClick,
    onKeyDown: onSummaryKeyDown,
    ...restSummaryProps
  } = summaryProps ?? {};

  function setOpen(nextOpen: boolean): void {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  function handleSummaryClick(event: MouseEvent<HTMLDivElement>): void {
    onSummaryClick?.(event);

    if (event.defaultPrevented || isInteractiveChild(event.target, event.currentTarget)) {
      return;
    }

    setOpen(!isOpen);
  }

  function handleSummaryKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    onSummaryKeyDown?.(event);

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
      data-slot="disclosure"
      data-state={isOpen ? "open" : "closed"}
      className={className}
      {...props}
    >
      <div
        {...restSummaryProps}
        aria-controls={contentId}
        aria-expanded={isOpen}
        data-slot="disclosure-summary"
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-lt-sm py-2 text-left text-lt-fg transition-colors select-none hover:bg-lt-muted focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 focus-visible:outline-none",
          summaryClassName,
        )}
        onClick={handleSummaryClick}
        onKeyDown={handleSummaryKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">{summary}</div>
        <Icon
          name="chevron-down"
          className={cn(
            "size-lt-icon-md shrink-0 text-lt-muted-fg transition-transform motion-reduce:transition-none",
            !isOpen && "-rotate-90",
          )}
        />
      </div>

      {isOpen && children !== null && children !== undefined ? (
        <div id={contentId} data-slot="disclosure-content" className="flex flex-col gap-4 pt-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function isInteractiveChild(target: EventTarget, summary: HTMLDivElement): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const interactiveElement = target.closest(
    'a[href], button, input, select, textarea, [contenteditable="true"], [role="button"]',
  );

  return interactiveElement !== null && interactiveElement !== summary;
}
