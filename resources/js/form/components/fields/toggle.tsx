import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import { cn } from "@lattice-php/lattice/lib/utils";
import { FormFieldFrame } from "@lattice-php/lattice/form/components/base/field";
import { toBoolean } from "@lattice-php/lattice/form/lib/conditions";
import { useFormContext } from "@lattice-php/lattice/form/hooks/context";
import { fieldDomName } from "@lattice-php/lattice/form/lib/field-dom-name";
import { useFieldScope } from "@lattice-php/lattice/form/hooks/field-scope";
import { useDependentField } from "@lattice-php/lattice/form/hooks/use-dependent-field";
import { useFieldCommit } from "@lattice-php/lattice/form/hooks/use-field-commit";
import { useSeedDefault } from "@lattice-php/lattice/form/hooks/use-seed-default";
import { useFormValue } from "@lattice-php/lattice/form/hooks/values";

export const ToggleComponent: RendererComponent<"field.toggle"> = ({ node }) => {
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const props = node.props;
  const localName = props.name;
  const scope = useFieldScope();
  const { errors, fieldIdPrefix } = useFormContext();
  const name = fieldDomName(scope ? scope.scopedName(localName) : localName, fieldIdPrefix);
  const errorKey = scope ? scope.errorKey(localName) : localName;
  const globalValue = useFormValue(localName);
  const storedValue = scope ? scope.getValue(localName) : globalValue;
  const defaultChecked = toBoolean(props.value);
  const checked = storedValue !== undefined ? toBoolean(storedValue) : defaultChecked;
  const locked = readOnly || disabled;
  const { commit } = useFieldCommit();

  useSeedDefault(localName, defaultChecked);

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={errors[errorKey]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      label={props.label ?? ""}
      name={name}
      required={required}
    >
      <input disabled={locked} name={name} type="hidden" value={checked ? "1" : "0"} />
      <button
        aria-checked={checked}
        aria-label={props.label ?? localName}
        autoFocus={props.autoFocus ?? false}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-lt-muted p-0.5 shadow-lt-xs transition-colors outline-none focus-visible:border-lt-ring focus-visible:ring-[3px] focus-visible:ring-lt-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-lt-primary",
        )}
        data-state={checked ? "checked" : "unchecked"}
        data-test={testIdentity(localName)}
        disabled={locked}
        id={name}
        name={name}
        onClick={() => commit(localName, !checked)}
        role="switch"
        tabIndex={props.tabIndex ?? undefined}
        type="button"
      >
        <span
          className="size-5 rounded-full bg-lt-bg shadow-lt-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          data-state={checked ? "checked" : "unchecked"}
        />
      </button>
    </FormFieldFrame>
  );
};
