import type { RendererComponent } from "@lattice/lattice/core/types";
import { Icon, IconRenderer } from "@lattice/lattice/icons";
import { Popover } from "./popover";

const DropdownComponent: RendererComponent<"dropdown"> = ({ children, node }) => {
  const icon = node.props.icon;
  const label = node.props.label;
  const slug = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <Popover
      testId={`dropdown-${slug}`}
      trigger={
        <span className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-lt-fg hover:bg-lt-muted">
          {icon ? <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} /> : null}
          <span>{label}</span>
          <Icon name="chevron-down" className="ml-auto size-lt-icon-md shrink-0" />
        </span>
      }
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </Popover>
  );
};

export default DropdownComponent;
