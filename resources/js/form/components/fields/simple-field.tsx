import type { ReactNode } from "react";
import type { Node } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "@lattice-php/lattice/form/components/base/field";
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
