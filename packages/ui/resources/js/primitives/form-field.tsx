import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";
import { InfoTooltip } from "./info-tooltip";
import InputError from "./input-error";
import { Label } from "./label";

export type FormFieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-required"?: boolean;
};

export type FormFieldProps = Omit<ComponentProps<"div">, "children" | "id"> & {
  bare?: boolean;
  children: (controlProps: FormFieldControlProps) => ReactNode;
  error?: string;
  helperText?: string;
  id: string;
  label: string;
  labelAction?: ReactNode;
  required?: boolean;
  tooltip?: string;
};

export function FormField({
  bare = false,
  children,
  className,
  error,
  helperText,
  id,
  label,
  labelAction,
  required,
  tooltip,
  ...props
}: FormFieldProps): ReactNode {
  const labelId = `${id}-label`;
  const helperTextId = !bare && helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperTextId, errorId].filter(Boolean).join(" ") || undefined;
  const control = children({
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    "aria-labelledby": label ? labelId : undefined,
    "aria-required": required || undefined,
  });

  if (bare) {
    return (
      <div {...props} className={cn("grid gap-1", className)}>
        <Label id={labelId} htmlFor={id} className="sr-only">
          {label}
        </Label>
        {control}
        <InputError id={errorId} message={error} />
      </div>
    );
  }

  return (
    <div {...props} className={cn("grid gap-2", className)}>
      <div className="flex min-h-5 items-center">
        <Label id={labelId} htmlFor={id}>
          {label}
        </Label>
        {required && (
          <span aria-hidden="true" className="ml-0.5 leading-none text-lt-danger">
            *
          </span>
        )}
        <InfoTooltip content={tooltip} />
        {labelAction && <span className="ml-auto text-sm">{labelAction}</span>}
      </div>

      {control}

      {helperText && (
        <p id={helperTextId} className="text-sm text-lt-muted-fg">
          {helperText}
        </p>
      )}

      <InputError id={errorId} message={error} />
    </div>
  );
}
