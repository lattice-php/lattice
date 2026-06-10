import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";

export const HiddenInputComponent: RendererComponent<"form.hidden-input"> = ({ node }) => (
  <input
    defaultValue={getStringProp(node.props, "value")}
    name={getStringProp(node.props, "name")}
    type="hidden"
  />
);
