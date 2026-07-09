import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { prefixedNodeTestId } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent, Schema } from "@lattice-php/lattice/core/types";
import {
  ActionTrigger,
  type TriggerState,
  useClickBehavior,
} from "@lattice-php/lattice/core/hooks/use-click-behavior";
import { Icon, IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { Affix } from "@lattice-php/lattice/types/generated";
import { useSidebarCollapsed } from "../hooks/context";
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
  const { icon, label, prefix, suffix } = node.props;
  const iconOnly = Boolean(icon);
  const flyoutIcon = icon ?? prefix?.icon ?? null;
  const currentPath = usePage().url.split("?")[0];
  const testId = prefixedNodeTestId("menu", node);
  const behavior = useClickBehavior(node.props);

  const content = icon ? (
    <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} />
  ) : (
    <>
      {prefix ? <MenuAffix affix={prefix} /> : null}
      {collapsed ? (
        <span
          className="pointer-events-none absolute top-1/2 left-full z-lt-popover ml-2 hidden -translate-y-1/2 rounded-lt-sm border border-lt-border bg-lt-popover px-2 py-1 text-sm whitespace-nowrap text-lt-popover-fg shadow-lt-md group-hover:block"
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

  const rowClassName = cn(
    rowClass,
    "w-full",
    collapsed && "group relative justify-center",
    iconOnly && "justify-center",
  );

  const triggerButton = ({ onClick, processing }: TriggerState) => (
    <button
      aria-label={collapsed || iconOnly ? label : undefined}
      className={rowClassName}
      data-test={testId}
      disabled={processing}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );

  if (behavior.kind === "action") {
    return (
      <li>
        <ActionTrigger action={behavior.action}>{triggerButton}</ActionTrigger>
      </li>
    );
  }

  if (behavior.kind === "effects") {
    return <li>{triggerButton({ onClick: behavior.onClick, processing: false })}</li>;
  }

  if (behavior.kind === "navigate") {
    const active = currentPath === behavior.href;

    return (
      <li>
        <Link
          aria-current={active ? "page" : undefined}
          aria-label={collapsed || iconOnly ? label : undefined}
          as={behavior.method === "get" ? undefined : "button"}
          className={cn(rowClassName, active && "bg-lt-muted font-medium")}
          data-test={testId}
          href={behavior.href}
          method={behavior.method}
        >
          {content}
        </Link>
      </li>
    );
  }

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

export default MenuItemComponent;
