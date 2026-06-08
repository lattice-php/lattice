import { Button } from "@lattice/core/components/button";
import { Spinner } from "@lattice/core/components/spinner";
import { useFormContext } from "../context";

type SubmitButtonVariant = "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";

export function FormSubmitButton({
  label,
  variant = "default",
}: {
  label: string;
  variant?: SubmitButtonVariant;
}) {
  const { errors, fieldLabels, processing } = useFormContext();

  const invalidFields = Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([name, message]) => ({ label: fieldLabels[name] ?? name, message: message as string }));
  const hasErrors = invalidFields.length > 0;

  return (
    <span className="group relative mt-4 flex w-full flex-col">
      <Button className="w-full" disabled={processing || hasErrors} type="submit" variant={variant}>
        {processing && <Spinner />}
        {label}
      </Button>

      {hasErrors && (
        <div
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-xs -translate-x-1/2 rounded-lt border border-lt-border bg-lt-surface p-3 text-left text-sm opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          role="tooltip"
        >
          <p className="mb-1 font-medium text-lt-fg">Fix these fields to continue:</p>
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
