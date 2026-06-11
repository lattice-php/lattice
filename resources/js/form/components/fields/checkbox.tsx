import { useEffect } from "react";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { Checkbox } from "../base/checkbox";
import { Label } from "../base/label";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";

function isTruthy(value: unknown): boolean {
  return value === true || value === "true" || value === "1" || value === 1;
}

export const CheckboxComponent: RendererComponent<"form.checkbox"> = ({ node }) => {
  const { clearErrors, precognitive, validate } = useFormContext();
  const { hidden, readonly, disabled } = useDependentField(node);
  const name = node.props.name;
  const setValue = useSetFormValue();
  const storedValue = useFormValue(name);
  const defaultChecked = false;
  const checked = storedValue !== undefined ? isTruthy(storedValue) : defaultChecked;

  useEffect(() => {
    if (storedValue === undefined) {
      setValue(name, defaultChecked);
    }
  }, [name, defaultChecked, setValue, storedValue]);

  if (hidden) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <Checkbox
        checked={checked}
        disabled={readonly || disabled}
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
  );
};
