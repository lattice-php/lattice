import type { ReactNode } from "react";
import type { Node } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { type ControlledField, useControlledField } from "../use-controlled-field";

/**
 * The shared shell for store-controlled single-input fields: wires the field
 * through useControlledField, renders nothing while conditions hide it, and
 * wraps the control in the standard labelled frame. The control is supplied as
 * a render prop, receiving the resolved field state.
 */
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
    <FormFieldFrame error={field.error} label={label} name={field.name} required={field.required}>
      {children(field)}
    </FormFieldFrame>
  );
}
