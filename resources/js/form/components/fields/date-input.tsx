import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.date-input": {
      autoFocus?: boolean;
      conditions?: unknown;
      disabled?: boolean;
      hidden?: boolean;
      label?: string;
      max?: string;
      min?: string;
      name?: string;
      readonly?: boolean;
      required?: boolean;
      tabIndex?: number;
      value?: string;
    };
  }
}

export const DateInputComponent: RendererComponent<"form.date-input"> = ({ node }) => {
  const { clearErrors, errors, precognitive, validate } = useFormContext();
  const { hidden, required, readonly, disabled } = useDependentField(node);
  const name = getStringProp(node.props, "name");
  const setValue = useSetFormValue();
  const storedValue = useFormValue(name);
  const currentValue = storedValue !== undefined ? storedValue : node.props?.value;
  const value =
    typeof currentValue === "string" || typeof currentValue === "number"
      ? String(currentValue)
      : "";

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={errors[name]}
      label={getStringProp(node.props, "label")}
      name={name}
      required={required}
    >
      <Input
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        disabled={disabled}
        id={name}
        max={getStringProp(node.props, "max") || undefined}
        min={getStringProp(node.props, "min") || undefined}
        name={name}
        onChange={(event) => {
          setValue(name, event.target.value);
          if (precognitive) {
            validate(name);
          } else {
            clearErrors(name);
          }
        }}
        readOnly={readonly}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        type="date"
        value={value}
      />
    </FormFieldFrame>
  );
};
