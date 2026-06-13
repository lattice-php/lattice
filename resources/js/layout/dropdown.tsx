import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { Popover } from "./popover";

const DropdownComponent: RendererComponent<"dropdown"> = ({ children, node }) => {
  const testId = node.key ?? "dropdown";

  return (
    <Popover
      placement={node.props.placement}
      testId={testId}
      trigger={
        <span className="flex min-w-0 items-center rounded-md px-2 py-1.5 text-sm hover:bg-lt-muted">
          {node.props.trigger.map((triggerNode, index) => (
            <RenderNode
              key={triggerNode.key ?? `${triggerNode.type}-${index}`}
              node={triggerNode}
            />
          ))}
        </span>
      }
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </Popover>
  );
};

export default DropdownComponent;
