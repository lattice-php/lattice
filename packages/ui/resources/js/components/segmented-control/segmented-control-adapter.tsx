import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { SegmentedControl } from "./segmented-control";

export const SegmentedControlAdapter: RendererComponent<"segmented-control"> = ({ node }) => {
  const { emits, name, options } = node.props;

  function emitChange(value: string): void {
    if (emits) {
      window.dispatchEvent(new CustomEvent(emits, { detail: { name, value } }));
    }
  }

  return (
    <SegmentedControl
      aria-label={node.props.label ?? undefined}
      data-test={nodeIdentity(node)}
      defaultValue={node.props.value || undefined}
      name={name}
      onValueChange={emitChange}
      options={options}
    />
  );
};
