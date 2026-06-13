import type { RendererComponent } from "@lattice/lattice/core/types";
import { Icon, IconRenderer } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";
import { useSidebarCollapsed } from "./context";
import { Popover } from "./popover";

const DropdownComponent: RendererComponent<"dropdown"> = ({ children, node }) => {
  const collapsed = useSidebarCollapsed();
  const icon = node.props.icon;
  const label = node.props.label;
  const slug = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <Popover
      placement={collapsed ? "right" : "bottom"}
      testId={`dropdown-${slug}`}
      triggerLabel={collapsed ? label : undefined}
      trigger={
        <span
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-lt-fg hover:bg-lt-muted",
            collapsed && "justify-center",
          )}
        >
          {icon ? <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} /> : null}
          <span className={cn(collapsed && "sr-only")}>{label}</span>
          {collapsed ? null : (
            <Icon name="chevron-down" className="ml-auto size-lt-icon-md shrink-0" />
          )}
        </span>
      }
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </Popover>
  );
};

export default DropdownComponent;
