import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useAction } from "@lattice-php/lattice/action/use-action";
import { prefixedNodeTestId } from "@lattice-php/lattice/core/test-id";
import type { Node, RendererComponent, Schema } from "@lattice-php/lattice/core/types";
import { Icon, IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { Affix } from "@lattice-php/lattice/types/generated";
import { useSidebarCollapsed } from "./context";
import { Popover } from "./popover";

const rowClass =
  "flex items-center gap-2 rounded-lt-sm px-3 py-2 text-base font-medium text-lt-fg transition-colors hover:bg-lt-muted";

function MenuAffix({ affix, className }: { affix: Affix; className?: string }) {
  if (affix.icon) {
    return <IconRenderer className={cn("size-lt-icon-md shrink-0", className)} icon={affix.icon} />;
  }

  return <span className={cn("shrink-0 text-sm text-lt-muted-fg", className)}>{affix.text}</span>;
}

function schemaContainsPath(schema: Schema | undefined, path: string): boolean {
  return (schema ?? []).some(
    (child) => child.props?.href === path || schemaContainsPath(child.schema, path),
  );
}

const MenuItemComponent: RendererComponent<"menu-item"> = ({ children, node }) => {
  const collapsed = useSidebarCollapsed();
  const icon = node.props.icon;
  const label = node.props.label;
  const prefix = node.props.prefix;
  const suffix = node.props.suffix;
  const iconOnly = Boolean(icon);
  const flyoutIcon = icon ?? prefix?.icon ?? null;
  const href = node.props.href ?? "";
  const currentPath = usePage().url.split("?")[0];
  const testId = prefixedNodeTestId("menu", node);

  const content = icon ? (
    <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} />
  ) : (
    <>
      {prefix ? <MenuAffix affix={prefix} /> : null}
      {collapsed ? (
        <span
          className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 rounded-lt-sm border border-lt-border bg-lt-popover px-2 py-1 text-sm whitespace-nowrap text-lt-popover-fg shadow-lt-md group-hover:block"
          role="tooltip"
        >
          {label}
        </span>
      ) : (
        <span>{label}</span>
      )}
      {suffix ? <MenuAffix affix={suffix} className="ml-auto" /> : null}
    </>
  );

  const action = node.props.action;

  if (action && href === "" && !children) {
    return (
      <ActionMenuItem
        action={action as Node<"action">}
        className={cn(
          rowClass,
          "w-full",
          collapsed && "group relative justify-center",
          iconOnly && "justify-center",
        )}
        label={collapsed || iconOnly ? label : undefined}
        testId={testId}
      >
        {content}
      </ActionMenuItem>
    );
  }

  if (href === "") {
    if (!children) {
      return collapsed ? null : (
        <li>
          <span className="flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wide text-lt-muted-fg uppercase">
            {content}
          </span>
        </li>
      );
    }

    if (collapsed) {
      return (
        <FlyoutGroup icon={flyoutIcon} label={label} testId={testId}>
          {children}
        </FlyoutGroup>
      );
    }

    return (
      <CollapsibleItem
        content={content}
        defaultOpen={schemaContainsPath(node.schema, currentPath)}
        testId={testId}
      >
        {children}
      </CollapsibleItem>
    );
  }

  const active = currentPath === href;
  const method = node.props.method ?? "get";

  return (
    <li>
      <Link
        aria-current={active ? "page" : undefined}
        aria-label={collapsed || iconOnly ? label : undefined}
        as={method === "get" ? undefined : "button"}
        className={cn(
          rowClass,
          "w-full",
          collapsed && "group relative justify-center",
          iconOnly && "justify-center",
          active && "bg-lt-muted font-medium",
        )}
        data-test={testId}
        href={href}
        method={method}
      >
        {content}
      </Link>
    </li>
  );
};

function CollapsibleItem({
  children,
  content,
  defaultOpen,
  testId,
}: {
  children: ReactNode;
  content: ReactNode;
  defaultOpen: boolean;
  testId?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li>
      <button
        aria-expanded={open}
        className={cn(rowClass, "w-full")}
        data-test={testId}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {content}
        <Icon
          name="chevron-right"
          className={cn(
            "ml-auto size-lt-icon-md shrink-0 transition-transform",
            open && "rotate-90",
          )}
        />
      </button>
      {open ? <ul className="mt-1 flex flex-col gap-1 pl-3">{children}</ul> : null}
    </li>
  );
}

function FlyoutGroup({
  children,
  icon,
  label,
  testId,
}: {
  children: ReactNode;
  icon?: string | null;
  label: string;
  testId?: string;
}) {
  return (
    <li>
      <Popover
        className="min-w-48"
        placement="right"
        testId={testId}
        trigger={
          icon ? (
            <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} />
          ) : (
            <span>{label}</span>
          )
        }
        triggerClassName={cn(rowClass, "justify-center")}
        triggerLabel={label}
      >
        <ul className="flex flex-col gap-1">
          <li className="px-3 py-1.5 text-xs font-semibold tracking-wide text-lt-muted-fg uppercase">
            {label}
          </li>
          {children}
        </ul>
      </Popover>
    </li>
  );
}

function ActionMenuItem({
  action,
  children,
  className,
  label,
  testId,
}: {
  action: Node<"action">;
  children: ReactNode;
  className: string;
  label?: string;
  testId?: string;
}) {
  const { processing, requestSubmit, overlays } = useAction(action);

  return (
    <li>
      <button
        aria-label={label}
        className={className}
        data-test={testId}
        disabled={processing}
        onClick={requestSubmit}
        type="button"
      >
        {children}
      </button>
      {overlays}
    </li>
  );
}

export default MenuItemComponent;
