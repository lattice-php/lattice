import { LabelAction } from '../../types.js';
import { ComponentProps, ReactNode } from 'react';
export type FormFieldControlProps = {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-labelledby"?: string;
    "aria-required"?: boolean;
};
type FormFieldFrameProps = Omit<ComponentProps<"div">, "children" | "id"> & {
    children: (controlProps: FormFieldControlProps) => ReactNode;
    error?: string;
    helperText?: string;
    id: string;
    label: string;
    labelAction?: LabelAction;
    required?: boolean;
    tooltip?: string;
};
export declare function FormFieldFrame({ children, className, error, helperText, id, label, labelAction, required, tooltip, ...props }: FormFieldFrameProps): ReactNode;
export {};
