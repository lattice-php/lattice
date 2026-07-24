import { Button } from "@lattice-php/lattice/ui/button";
import { Spinner } from "@lattice-php/lattice/ui/spinner";
import type { Emphasis, Variant } from "@lattice-php/lattice/types/generated";
import { useFormContext } from "@lattice-php/lattice/form/hooks/context";

export function FormSubmitButton({
  label,
  summaryLabel,
  variant = null,
  emphasis = "solid",
}: {
  label: string;
  summaryLabel: string;
  variant?: Variant | null;
  emphasis?: Emphasis;
}) {
  const { componentId, errors, fieldLabels, processing } = useFormContext();

  const invalidFields = Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([name, message]) => ({ label: fieldLabels[name] ?? name, message: message as string }));
  const hasErrors = invalidFields.length > 0;

  return (
    <span className="group relative inline-flex flex-col">
      <Button
        data-lattice-form={componentId}
        data-test="form-submit"
        disabled={processing || hasErrors}
        emphasis={emphasis}
        type="submit"
        variant={variant}
      >
        {processing && <Spinner />}
        {label}
      </Button>

      {hasErrors && (
        <div
          className="pointer-events-none absolute bottom-full left-1/2 z-lt-popover mb-2 w-max max-w-xs -translate-x-1/2 rounded-lt border border-lt-border bg-lt-surface p-3 text-left text-sm opacity-0 shadow-lt-md transition-opacity group-hover:opacity-100"
          role="tooltip"
        >
          <p className="mb-1 font-medium text-lt-fg">{summaryLabel}</p>
          <ul className="space-y-1">
            {invalidFields.map((field) => (
              <li className="text-lt-muted-fg" key={field.label}>
                <span className="font-medium text-lt-fg">{field.label}</span> — {field.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
}
