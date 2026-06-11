import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormSubmitButton } from "../base/submit-button";

export const SubmitButtonComponent: RendererComponent<"form.submit-button"> = ({ node }) => {
  return (
    <FormSubmitButton
      label={node.props.label ?? "Submit"}
      variant={node.props.variant ?? "default"}
    />
  );
};
