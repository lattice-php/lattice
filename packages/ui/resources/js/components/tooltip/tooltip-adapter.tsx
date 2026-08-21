import { Renderer } from "@lattice-php/core/renderer";
import { toNodes } from "@lattice-php/core/nodes";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Tooltip } from "./tooltip";

const TooltipAdapter: RendererComponent<"tooltip"> = ({ node }) => {
  const content = node.props.content;
  const trigger = toNodes(node.props.trigger);
  const identity = nodeIdentity(node);

  return (
    <Tooltip
      content={content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : null}
      trigger={trigger.length > 0 ? <Renderer nodes={trigger} /> : null}
      triggerProps={{
        "data-lattice-component": identity,
        "data-test": identity ? `${identity}-trigger` : undefined,
      }}
    />
  );
};

export default TooltipAdapter;
