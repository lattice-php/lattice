import InputError from "@lattice-php/ui/input-error";
import { InfoTooltip } from "@lattice-php/ui/info-tooltip";
import { TextLink } from "@lattice-php/ui/text-link";
import { Label } from "@lattice-php/ui/label";
import { useInTableCell } from "@lattice-php/form/hooks/row-layout-context";
import { cn } from "@lattice-php/ui/lib/utils";
import type { LabelAction } from "@lattice-php/form/types";
import type { ComponentProps, ReactNode } from "react";

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

export function FormFieldFrame({
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
}: FormFieldFrameProps): ReactNode {
  const bare = useInTableCell();
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
          <span aria-hidden="true" className="ml-0.5 text-lt-danger">
            *
          </span>
        )}
        <InfoTooltip content={tooltip} />
        {labelAction && (
          <TextLink
            href={labelAction.href}
            tabIndex={labelAction.tabIndex ?? undefined}
            className="ml-auto text-sm"
          >
            {labelAction.label}
          </TextLink>
        )}
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
