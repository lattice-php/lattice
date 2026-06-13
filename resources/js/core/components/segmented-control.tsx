import { useState } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { SegmentedPills } from "./segmented-pills";

const SegmentedControlComponent: RendererComponent<"segmented-control"> = ({ node }) => {
  const { options, name, emits } = node.props;
  const [value, setValue] = useState(node.props.value || options[0]?.value || "");

  if (options.length === 0) {
    return null;
  }

  function select(next: string): void {
    setValue(next);

    if (emits) {
      window.dispatchEvent(new CustomEvent(emits, { detail: { name, value: next } }));
    }
  }

  return (
    <SegmentedPills
      ariaLabel={node.props.label ?? undefined}
      name={name}
      onSelect={select}
      options={options}
      value={value}
    />
  );
};

export default SegmentedControlComponent;
