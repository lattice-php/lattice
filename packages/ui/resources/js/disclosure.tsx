import type { ComponentProps, ReactNode } from "react";
import { Icon } from "./icons";
import { cn } from "./lib/utils";

export type DisclosureSummaryProps = Omit<ComponentProps<"summary">, "children"> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

export type DisclosureProps = Omit<ComponentProps<"details">, "children" | "open"> & {
  children?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  summary: ReactNode;
  summaryProps?: DisclosureSummaryProps;
};

export function Disclosure({
  children,
  className,
  defaultOpen,
  open,
  summary,
  summaryProps,
  ...props
}: DisclosureProps) {
  const { className: summaryClassName, ...restSummaryProps } = summaryProps ?? {};

  return (
    <details
      data-slot="disclosure"
      className={cn("group", className)}
      open={open ?? defaultOpen}
      {...props}
    >
      <summary
        data-slot="disclosure-summary"
        className={cn(
          "flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-4 rounded-lt-sm py-2 text-left text-lt-fg transition-colors select-none hover:bg-lt-muted focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden",
          summaryClassName,
        )}
        {...restSummaryProps}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">{summary}</span>
        <Icon
          name="chevron-down"
          className="size-lt-icon-md shrink-0 -rotate-90 text-lt-muted-fg transition-transform group-open:rotate-0 motion-reduce:transition-none"
        />
      </summary>

      {children !== null && children !== undefined ? (
        <div data-slot="disclosure-content" className="flex flex-col gap-4 pt-2">
          {children}
        </div>
      ) : null}
    </details>
  );
}
