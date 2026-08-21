import type { ReactNode } from "react";
import type { Node } from "@lattice-php/core";
import { FormFieldFrame, type FormFieldControlProps } from "./field";
import { fieldLabelAction } from "./label-action";
import { fieldProps } from "../../lib/field-props";
import { type ControlledField, useControlledField } from "../../hooks/use-controlled-field";

export function SimpleField({
  node,
  label,
  children,
}: {
  node: Node;
  label: string;
  children: (field: ControlledField, controlProps: FormFieldControlProps) => ReactNode;
}) {
  const field = useControlledField(node);

  if (field.hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={field.error}
      helperText={fieldProps(node).helperText ?? undefined}
      tooltip={fieldProps(node).tooltip ?? undefined}
      labelAction={fieldLabelAction(fieldProps(node).labelAction)}
      label={label}
      id={field.name}
      required={field.required}
    >
      {(controlProps) => children(field, controlProps)}
    </FormFieldFrame>
  );
}
