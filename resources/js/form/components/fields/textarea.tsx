import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Textarea } from "../base/textarea";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.textarea": {
      autoFocus?: boolean;
      conditions?: unknown;
      disabled?: boolean;
      hidden?: boolean;
      label?: string;
      name?: string;
      placeholder?: string;
      readonly?: boolean;
      required?: boolean;
      rows?: number;
      tabIndex?: number;
      value?: string;
    };
  }
}

export const TextareaComponent: RendererComponent<"form.textarea"> = ({ node }) => {
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
      <Textarea
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        disabled={disabled}
        id={name}
        name={name}
        onChange={(event) => {
          setValue(name, event.target.value);
          if (precognitive) {
            validate(name);
          } else {
            clearErrors(name);
          }
        }}
        placeholder={getStringProp(node.props, "placeholder")}
        readOnly={readonly}
        rows={getOptionalNumberProp(node.props, "rows")}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        value={value}
      />
    </FormFieldFrame>
  );
};
