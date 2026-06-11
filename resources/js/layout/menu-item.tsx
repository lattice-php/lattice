import { Link, usePage } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { RendererComponent, Schema } from "@lattice/lattice/core/types";
import { IconRenderer } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";

const rowClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-lt-fg transition-colors hover:bg-lt-muted";

function schemaContainsPath(schema: Schema | undefined, path: string): boolean {
  return (schema ?? []).some(
    (child) => child.props?.href === path || schemaContainsPath(child.schema, path),
  );
}

const MenuItemComponent: RendererComponent<"menu-item"> = ({ children, node }) => {
  const icon = node.props.icon;
  const href = node.props.href ?? "";
  const currentPath = usePage().url.split("?")[0];

  const content = (
    <>
      {icon ? <IconRenderer className="size-4 shrink-0" icon={icon} /> : null}
      <span>{node.props.label}</span>
    </>
  );

  if (href === "") {
    if (!children) {
      return (
        <li>
          <span className="flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wide text-lt-muted-fg uppercase">
            {content}
          </span>
        </li>
      );
    }

    return (
      <CollapsibleItem content={content} defaultOpen={schemaContainsPath(node.schema, currentPath)}>
        {children}
      </CollapsibleItem>
    );
  }

  const active = currentPath === href;

  return (
    <li>
      <Link
        aria-current={active ? "page" : undefined}
        className={cn(rowClass, active && "bg-lt-muted font-medium")}
        href={href}
        method={node.props.method ?? "get"}
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
}: {
  children: ReactNode;
  content: ReactNode;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li>
      <button
        aria-expanded={open}
        className={cn(rowClass, "w-full")}
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

export default MenuItemComponent;
