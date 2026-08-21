import { FormField } from "../../primitives/form-field";
import type { FormFieldProps } from "../../primitives/form-field";
import { useInTableCell } from "../../hooks/row-layout-context";
import type { ReactNode } from "react";

export type { FormFieldControlProps } from "../../primitives/form-field";

export type FormFieldFrameProps = Omit<FormFieldProps, "bare">;

export function FormFieldFrame(props: FormFieldFrameProps): ReactNode {
  return <FormField {...props} bare={useInTableCell()} />;
}
