import { Renderer } from "@lattice-php/core/renderer";
import { toNodes } from "@lattice-php/core/nodes";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Popover, PopoverContent, PopoverTrigger } from "../../primitives/popover";

const PopoverAdapter: RendererComponent<"popover"> = ({ children, node }) => {
  const trigger = toNodes(node.props.trigger);
  const identity = nodeIdentity(node);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={node.props.label ?? undefined}
        data-lattice-component={identity}
        data-test={identity ? `${identity}-trigger` : undefined}
        type="button"
      >
        <Renderer nodes={trigger} />
      </PopoverTrigger>
      <PopoverContent align={node.props.align} side={node.props.side}>
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default PopoverAdapter;
