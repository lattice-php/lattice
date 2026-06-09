import { useEffect } from "react";
import { getOptionalNumberProp, getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { Checkbox } from "../base/checkbox";
import { Label } from "../base/label";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    "form.checkbox": {
      checked?: boolean;
      conditions?: unknown;
      disabled?: boolean;
      hidden?: boolean;
      label?: string;
      name?: string;
      required?: boolean;
      tabIndex?: number;
    };
  }
}

function isTruthy(value: unknown): boolean {
  return value === true || value === "true" || value === "1" || value === 1;
}

export const CheckboxComponent: RendererComponent<"form.checkbox"> = ({ node }) => {
  const { clearErrors, precognitive, validate } = useFormContext();
  const { hidden, readonly, disabled } = useDependentField(node);
  const name = getStringProp(node.props, "name");
  const setValue = useSetFormValue();
  const storedValue = useFormValue(name);
  const checked = storedValue !== undefined ? isTruthy(storedValue) : Boolean(node.props?.checked);

  useEffect(() => {
    if (storedValue === undefined) {
      setValue(name, Boolean(node.props?.checked));
    }
  }, [name, node.props?.checked, setValue, storedValue]);

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
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
      />
      <Label htmlFor={name}>{getStringProp(node.props, "label")}</Label>
    </div>
  );
};
