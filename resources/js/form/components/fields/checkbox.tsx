import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Checkbox } from "../base/checkbox";
import { Label } from "../base/label";
import { toBoolean } from "../conditions";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useSeedDefault } from "../use-seed-default";
import { useFormValue, useSetFormValue } from "../values";

export const CheckboxComponent: RendererComponent<"form.checkbox"> = ({ node }) => {
  const { clearErrors, precognitive, validate } = useFormContext();
  const { hidden, readOnly, disabled } = useDependentField(node);
  const name = node.props.name;
  const setValue = useSetFormValue();
  const storedValue = useFormValue(name);
  const defaultChecked = toBoolean(node.props.value);
  const checked = storedValue !== undefined ? toBoolean(storedValue) : defaultChecked;

  useSeedDefault(name, defaultChecked);

  if (hidden) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center space-x-3">
        <Checkbox
          autoFocus={node.props.autoFocus ?? undefined}
          checked={checked}
          disabled={readOnly || disabled}
          id={name}
          name={name}
          onCheckedChange={(next) => {
            const value = next === true;
            setValue(name, value);
            if (precognitive) {
              window.requestAnimationFrame(() => validate(name));
            } else {
              clearErrors(name);
            }
          }}
          tabIndex={node.props.tabIndex ?? undefined}
        />
        <Label htmlFor={name}>{node.props.label}</Label>
      </div>
      {node.props.helperText && (
        <p className="mt-1 pl-7 text-sm text-lt-muted-fg">{node.props.helperText}</p>
      )}
    </div>
  );
};
