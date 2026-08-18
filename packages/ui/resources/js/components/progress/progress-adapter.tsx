import type { RendererComponent } from "@lattice-php/core/types";
import { Progress } from "./progress";

const ProgressAdapter: RendererComponent<"progress"> = ({ node }) => (
  <Progress
    color={node.props.color}
    max={node.props.max}
    shape={node.props.shape}
    showValue={node.props.showValue}
    size={node.props.size}
    value={node.props.value}
  />
);

export default ProgressAdapter;
