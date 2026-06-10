import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormSubmitButton, type SubmitButtonVariant } from "../base/submit-button";

const variants: SubmitButtonVariant[] = [
  "default",
  "destructive",
  "ghost",
  "link",
  "outline",
  "secondary",
];

function asVariant(value: unknown): SubmitButtonVariant {
  return variants.includes(value as SubmitButtonVariant)
    ? (value as SubmitButtonVariant)
    : "default";
}

export const SubmitButtonComponent: RendererComponent<"form.submit-button"> = ({ node }) => {
  return (
    <FormSubmitButton
      label={getStringProp(node.props, "label", "Submit")}
      variant={asVariant(node.props?.variant)}
    />
  );
};
