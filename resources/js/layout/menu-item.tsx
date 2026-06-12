import { Link, usePage } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import type { RendererComponent, Schema } from "@lattice/lattice/core/types";
import { IconRenderer } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";
import { useT } from "@lattice/lattice/i18n";
import { SidebarCollapsedContext, useSidebarCollapsed } from "./context";

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
      {icon ? <IconRenderer className="size-4 shrink-0" icon={icon} /> : null}
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

  return (
    <li>
      <Link
        aria-current={active ? "page" : undefined}
        className={cn(rowClass, collapsed && "justify-center", active && "bg-lt-muted font-medium")}
        data-test={`menu-${slug}`}
        href={href}
        method={node.props.method ?? "get"}
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
        <ChevronRight
          aria-hidden="true"
          className={cn("ml-auto size-4 shrink-0 transition-transform", open && "rotate-90")}
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
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const url = usePage().url;

  useEffect(() => setOpen(false), [url]);

  function toggle(): void {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (rect) {
      setPosition({ left: rect.right + 4, top: rect.top });
    }

    setOpen((value) => !value);
  }

  return (
    <li>
      <button
        aria-expanded={open}
        aria-label={label}
        className={cn(rowClass, "w-full justify-center")}
        data-test={testId}
        onClick={toggle}
        ref={triggerRef}
        title={label}
        type="button"
      >
        {icon ? <IconRenderer className="size-4 shrink-0" icon={icon} /> : <span>{label}</span>}
      </button>
      {open
        ? createPortal(
            <>
              <button
                aria-label={t("a11y.closeMenu", "Close menu")}
                className="fixed inset-0 z-40 cursor-default"
                data-test={`${testId}-close`}
                onClick={() => setOpen(false)}
                type="button"
              />
              <SidebarCollapsedContext.Provider value={false}>
                <ul
                  className="fixed z-50 min-w-48 rounded-md border border-lt-border bg-lt-popover p-1 text-lt-popover-fg shadow-lg"
                  style={{ left: position.left, top: position.top }}
                >
                  <li className="px-3 py-1.5 text-xs font-semibold tracking-wide text-lt-muted-fg uppercase">
                    {label}
                  </li>
                  {children}
                </ul>
              </SidebarCollapsedContext.Provider>
            </>,
            document.body,
          )
        : null}
    </li>
  );
}

export default MenuItemComponent;
