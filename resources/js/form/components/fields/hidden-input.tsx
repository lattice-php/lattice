import { getStringProp } from "@bambamboole/lattice/core/props";
import type { RendererComponent } from "@bambamboole/lattice/core/types";

declare module "@bambamboole/lattice/core/types" {
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
