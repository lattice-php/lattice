import { Renderer } from "@lattice-php/core/renderer";
import { toNodes } from "@lattice-php/core/nodes";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Dropdown } from "./dropdown";

const DropdownAdapter: RendererComponent<"dropdown"> = ({ children, node }) => {
  const identity = nodeIdentity(node) ?? "dropdown";

  return (
    <Dropdown
      className="w-auto"
      data-test={identity}
      placement={node.props.placement}
      trigger={
        <span className="flex min-w-0 items-center rounded-lt-sm px-2 py-1.5 text-sm hover:bg-lt-muted">
          <Renderer nodes={toNodes(node.props.trigger)} />
        </span>
      }
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </Dropdown>
  );
};

export default DropdownAdapter;
