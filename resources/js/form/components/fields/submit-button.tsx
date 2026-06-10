import { getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import type { ButtonVariant } from "@lattice/lattice/types/generated";
import { FormSubmitButton } from "../base/submit-button";

const variants: ButtonVariant[] = [
  "default",
  "destructive",
  "ghost",
  "link",
  "outline",
  "secondary",
];

function asVariant(value: unknown): ButtonVariant {
  return variants.includes(value as ButtonVariant) ? (value as ButtonVariant) : "default";
}

export const SubmitButtonComponent: RendererComponent<"form.submit-button"> = ({ node }) => {
  return (
    <FormSubmitButton
      label={getStringProp(node.props, "label", "Submit")}
      variant={asVariant(node.props?.variant)}
    />
  );
};
