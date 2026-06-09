import { getStringProp } from "@bambamboole/lattice/core/props";
import type { RendererComponent } from "@bambamboole/lattice/core/types";
import { FormSubmitButton } from "../base/submit-button";

declare module "@bambamboole/lattice/core/types" {
  interface ComponentProps {
    "form.submit-button": {
      label?: string;
      variant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
    };
  }
}

export const SubmitButtonComponent: RendererComponent<"form.submit-button"> = ({ node }) => {
  return (
    <FormSubmitButton
      label={getStringProp(node.props, "label", "Submit")}
      variant={node.props?.variant ?? "default"}
    />
  );
};
