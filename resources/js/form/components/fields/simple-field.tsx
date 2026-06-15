import type { ReactNode } from "react";
import type { Node } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { fieldProps } from "../field-props";
import { type ControlledField, useControlledField } from "../use-controlled-field";

/** The shared shell for single-input fields; the control is a render prop receiving the resolved field state. */
export function SimpleField({
  node,
  label,
  children,
}: {
  node: Node;
  label: string;
  children: (field: ControlledField) => ReactNode;
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
      label={label}
      name={field.name}
      required={field.required}
    >
      {children(field)}
    </FormFieldFrame>
  );
}
