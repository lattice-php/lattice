import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { RendererComponent, Schema } from "@lattice/lattice/core/types";
import { Icon, IconRenderer } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";
import { useSidebarCollapsed } from "./context";
import { Popover } from "./popover";

const rowClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-lt-fg transition-colors hover:bg-lt-muted";

function schemaContainsPath(schema: Schema | undefined, path: string): boolean {
  return (schema ?? []).some(
    (child) => child.props?.href === path || schemaContainsPath(child.schema, path),
  );
}

const MenuItemComponent: RendererComponent<"menu-item"> = ({ children, node }) => {
  const collapsed = useSidebarCollapsed();
  const icon = node.props.icon;
  const label = node.props.label;
  const href = node.props.href ?? "";
  const currentPath = usePage().url.split("?")[0];
  const slug = label.toLowerCase().replace(/\s+/g, "-");

  const content = (
    <>
      {icon ? <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} /> : null}
      <span className={cn(collapsed && "sr-only")}>{label}</span>
    </>
  );

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
        <FlyoutGroup icon={icon} label={label} testId={`menu-${slug}`}>
          {children}
        </FlyoutGroup>
      );
    }

    return (
      <CollapsibleItem
        content={content}
        defaultOpen={schemaContainsPath(node.schema, currentPath)}
        testId={`menu-${slug}`}
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
        as={method === "get" ? undefined : "button"}
        className={cn(rowClass, collapsed && "justify-center", active && "bg-lt-muted font-medium")}
        data-test={`menu-${slug}`}
        href={href}
        method={method}
        title={collapsed ? label : undefined}
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
  testId: string;
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
  testId: string;
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
