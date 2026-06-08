import InputError from "@lattice/form/components/base/input-error";
import { TextLink } from "@lattice/core/components/link";
import { Label } from "@lattice/form/components/base/label";
import type { FormLabelAction } from "../types";

export function FormFieldFrame({
  children,
  error,
  label,
  labelAction,
  name,
  required,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
  labelAction?: FormLabelAction;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex min-h-5 items-center">
        <Label htmlFor={name}>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-lt-danger">
              *
            </span>
          )}
        </Label>
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

      <InputError message={error} />
    </div>
  );
}
