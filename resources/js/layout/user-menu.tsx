import type { RendererComponent } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";
import { useSidebarCollapsed } from "./context";
import { Popover } from "./popover";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const UserMenuComponent: RendererComponent<"user-menu"> = ({ children, node }) => {
  const collapsed = useSidebarCollapsed();
  const { avatar, email, name } = node.props;

  return (
    <Popover
      align="end"
      testId="user-menu"
      trigger={
        <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-lt-muted">
          {avatar ? (
            <img alt={name} className="size-8 shrink-0 rounded-md object-cover" src={avatar} />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-lt-muted text-xs font-medium">
              {initials(name)}
            </span>
          )}
          <span className={cn("flex min-w-0 flex-col text-left", collapsed && "sr-only")}>
            <span className="truncate font-medium">{name}</span>
            {email ? <span className="truncate text-xs text-lt-muted-fg">{email}</span> : null}
          </span>
        </span>
      }
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </Popover>
  );
};

export default UserMenuComponent;
