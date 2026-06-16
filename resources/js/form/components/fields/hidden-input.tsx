import type { RendererComponent } from "@lattice-php/lattice/core/types";

export const HiddenInputComponent: RendererComponent<"field.hidden-input"> = ({ node }) => (
  <input
    defaultValue={typeof node.props.value === "string" ? node.props.value : ""}
    name={node.props.name}
    type="hidden"
  />
);
