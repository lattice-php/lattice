import InputError from "@lattice/lattice/form/components/base/input-error";
import { TextLink } from "@lattice/lattice/core/components/link";
import { Label } from "@lattice/lattice/form/components/base/label";
import type { FormLabelAction } from "../types";

export function FormFieldFrame({
  children,
  error,
  helperText,
  label,
  labelAction,
  name,
  required,
}: {
  children: React.ReactNode;
  error?: string;
  helperText?: string;
  label: string;
  labelAction?: FormLabelAction;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex min-h-5 items-center">
        <Label htmlFor={name}>{label}</Label>
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-lt-danger">
            *
          </span>
        )}
        {labelAction && (
          <TextLink
            href={labelAction.href}
            tabIndex={labelAction.tabIndex}
            className="ml-auto text-sm"
          >
            {labelAction.label}
          </TextLink>
        )}
      </div>

      {children}

      {helperText && <p className="text-sm text-lt-muted-fg">{helperText}</p>}

      <InputError message={error} />
    </div>
  );
}
