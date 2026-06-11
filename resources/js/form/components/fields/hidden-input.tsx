import type { RendererComponent } from "@lattice/lattice/core/types";

export const HiddenInputComponent: RendererComponent<"form.hidden-input"> = ({ node }) => (
  <input
    defaultValue={typeof node.props.value === "string" ? node.props.value : ""}
    name={node.props.name}
    type="hidden"
  />
);
