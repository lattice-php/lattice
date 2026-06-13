import InputError from "@lattice-php/lattice/form/components/base/input-error";
import { TextLink } from "@lattice-php/lattice/core/components/link";
import { Label } from "@lattice-php/lattice/form/components/base/label";
import { useInTableCell } from "../row-layout-context";
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
  const bare = useInTableCell();

  if (bare) {
    return (
      <div className="grid gap-1">
        <Label htmlFor={name} className="sr-only">
          {label}
        </Label>
        {children}
        <InputError message={error} />
      </div>
    );
  }

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
