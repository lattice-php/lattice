import type { ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import {
  FormFieldFrame,
  type FormFieldControlProps,
} from "@lattice-php/lattice/form/components/base/field";
import { fieldProps } from "@lattice-php/lattice/form/lib/field-props";
import {
  type ControlledField,
  useControlledField,
} from "@lattice-php/lattice/form/hooks/use-controlled-field";

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
      label={label}
      id={field.name}
      required={field.required}
    >
      {(controlProps) => children(field, controlProps)}
    </FormFieldFrame>
  );
}
