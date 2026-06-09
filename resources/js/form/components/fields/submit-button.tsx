import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormSubmitButton } from "../base/submit-button";

declare module "@lattice/lattice/core/types" {
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
