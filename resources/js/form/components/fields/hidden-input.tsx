import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    "form.hidden-input": {
      name?: string;
      value?: string;
    };
  }
}

export const HiddenInputComponent: RendererComponent<"form.hidden-input"> = ({ node }) => (
  <input
    defaultValue={getStringProp(node.props, "value")}
    name={getStringProp(node.props, "name")}
    type="hidden"
  />
);
