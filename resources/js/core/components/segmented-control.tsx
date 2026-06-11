import { useState } from "react";
import { getOptionalNumberProp, getOptions, getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { SegmentedPills } from "./segmented-pills";

const SegmentedControlComponent: RendererComponent<"segmented-control"> = ({ node }) => {
  const options = getOptions(node.props);
  const name = getStringProp(node.props, "name");
  const emits = getStringProp(node.props, "emits");
  const [value, setValue] = useState(getStringProp(node.props, "value") || options[0]?.value || "");

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
      ariaLabel={getStringProp(node.props, "label")}
      onSelect={select}
      options={options}
      tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
      value={value}
    />
  );
};

export default SegmentedControlComponent;
