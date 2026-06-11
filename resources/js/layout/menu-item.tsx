import type { Method } from "@inertiajs/core";
import { Link, usePage } from "@inertiajs/react";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { IconRenderer } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";

function getLinkMethod(method: string): Method {
  if (method === "delete" || method === "patch" || method === "post" || method === "put") {
    return method;
  }

  return "get";
}

const MenuItemComponent: RendererComponent<"menu-item"> = ({ children, node }) => {
  const label = node.props.label;
  const href = node.props.href ?? "";
  const icon = node.props.icon;
  const method = getLinkMethod(node.props.method ?? "get");
  const currentPath = usePage().url.split("?")[0];
  const active = href !== "" && currentPath === href;

  const content = (
    <>
      {icon ? <IconRenderer className="size-4 shrink-0" icon={icon} /> : null}
      <span>{label}</span>
    </>
  );

  return (
    <li>
      {href ? (
        <Link
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-lt-fg transition-colors hover:bg-lt-muted",
            active && "bg-lt-muted font-medium",
          )}
          href={href}
          method={method}
        >
          {content}
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wide text-lt-muted-fg uppercase">
          {content}
        </span>
      )}
      {children ? <ul className="flex flex-col gap-1 pl-3">{children}</ul> : null}
    </li>
  );
};

export default MenuItemComponent;
