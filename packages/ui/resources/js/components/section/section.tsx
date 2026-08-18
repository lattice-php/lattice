import { type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { Icon } from "../../icons";
import { InfoTooltip } from "../../primitives/info-tooltip";
import { cn } from "../../lib/utils";
import { useCollapsibleState } from "../../lib/use-collapsible-state";

export type SectionToggleProps = Omit<
  ComponentProps<"button">,
  "aria-expanded" | "aria-label" | "children" | "type"
> & {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

export type SectionProps = Omit<ComponentProps<"section">, "children" | "title"> & {
  children?: ReactNode;
  collapsed?: boolean;
  collapsible?: boolean;
  collapseLabel?: string;
  defaultCollapsed?: boolean;
  description?: ReactNode;
  expandLabel?: string;
  headerActions?: ReactNode;
  onCollapsedChange?: (collapsed: boolean) => void;
  storageKey?: string;
  title?: ReactNode;
  toggleProps?: SectionToggleProps;
  tooltip?: string | null;
};

export function Section({
  children,
  className,
  collapsed,
  collapsible = false,
  collapseLabel = "Collapse section",
  defaultCollapsed = false,
  description,
  expandLabel = "Expand section",
  headerActions,
  onCollapsedChange,
  storageKey,
  title,
  toggleProps,
  tooltip,
  ...props
}: SectionProps) {
  const [uncontrolledCollapsed, toggleUncontrolledCollapsed] = useCollapsibleState(
    storageKey ?? "",
    defaultCollapsed,
    collapsible && collapsed === undefined && storageKey !== undefined,
  );
  const isCollapsed = collapsible && (collapsed ?? uncontrolledCollapsed);
  const hasTitle = hasContent(title);
  const hasDescription = hasContent(description);
  const hasHeaderActions = hasContent(headerActions);
  const hasHeader = hasTitle || hasDescription || hasHeaderActions || collapsible;
  const {
    className: toggleClassName,
    onClick: onToggleClick,
    ...restToggleProps
  } = toggleProps ?? {};

  function toggleCollapsed(event: MouseEvent<HTMLButtonElement>): void {
    onToggleClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const nextCollapsed = !isCollapsed;

    if (collapsed === undefined) {
      toggleUncontrolledCollapsed();
    }

    onCollapsedChange?.(nextCollapsed);
  }

  return (
    <section
      {...props}
      data-slot="section"
      className={cn(
        "flex flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface py-lt-gutter text-lt-surface-fg shadow-lt-sm",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex items-start justify-between gap-4 px-lt-gutter">
          <div className="flex min-w-0 items-start gap-2">
            {collapsible ? (
              <button
                {...restToggleProps}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? expandLabel : collapseLabel}
                className={cn(
                  "mt-0.5 inline-flex shrink-0 items-center rounded-lt-sm p-0.5 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg",
                  toggleClassName,
                )}
                onClick={toggleCollapsed}
                type="button"
              >
                <Icon
                  name="chevron-down"
                  className={cn(
                    "size-lt-icon-md transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                />
              </button>
            ) : null}
            <div className="flex min-w-0 flex-col gap-1.5">
              {hasTitle ? (
                <div className="flex items-center">
                  <div className="font-semibold leading-none">{title}</div>
                  <InfoTooltip content={tooltip} />
                </div>
              ) : null}
              {hasDescription ? (
                <div className="flex items-center">
                  <div className="text-sm text-lt-muted-fg">{description}</div>
                  {!hasTitle ? <InfoTooltip content={tooltip} /> : null}
                </div>
              ) : null}
            </div>
          </div>

          {hasHeaderActions ? (
            <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
          ) : null}
        </div>
      ) : null}

      {!isCollapsed && hasContent(children) ? (
        <div className="flex flex-col gap-6 px-lt-gutter">{children}</div>
      ) : null}
    </section>
  );
}

function hasContent(node: ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== "";
}
