import { asButtonVariant } from "@lattice/lattice/core/components/button";
import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormSubmitButton } from "../base/submit-button";

export const SubmitButtonComponent: RendererComponent<"form.submit-button"> = ({ node }) => {
  return (
    <FormSubmitButton
      label={getStringProp(node.props, "label", "Submit")}
      variant={asButtonVariant(node.props?.variant)}
    />
  );
};
