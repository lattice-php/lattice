import { FormField } from "@lattice-php/ui/primitives/form-field";
import type { FormFieldProps } from "@lattice-php/ui/primitives/form-field";
import { useInTableCell } from "@lattice-php/form/hooks/row-layout-context";
import type { ReactNode } from "react";

export type { FormFieldControlProps } from "@lattice-php/ui/primitives/form-field";

export type FormFieldFrameProps = Omit<FormFieldProps, "bare">;

export function FormFieldFrame(props: FormFieldFrameProps): ReactNode {
  return <FormField {...props} bare={useInTableCell()} />;
}
