import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.number-input": {
      autoFocus?: boolean;
      conditions?: unknown;
      disabled?: boolean;
      hidden?: boolean;
      label?: string;
      max?: number;
      min?: number;
      name?: string;
      placeholder?: string;
      readonly?: boolean;
      required?: boolean;
      slider?: boolean;
      step?: number;
      tabIndex?: number;
      value?: string;
    };
  }
}

export const NumberInputComponent: RendererComponent<"form.number-input"> = ({ node }) => {
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
  const isSlider = getBooleanProp(node.props, "slider");

  if (hidden) {
    return null;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(name, event.target.value);
    if (precognitive) {
      validate(name);
    } else {
      clearErrors(name);
    }
  };

  return (
    <FormFieldFrame
      error={errors[name]}
      label={getStringProp(node.props, "label")}
      name={name}
      required={required}
    >
      {isSlider ? (
        <div className="flex items-center gap-3">
          <input
            aria-label={getStringProp(node.props, "label")}
            className="h-2 w-full cursor-pointer appearance-none rounded-lt-sm bg-lt-muted accent-lt-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || readonly}
            id={name}
            max={getOptionalNumberProp(node.props, "max")}
            min={getOptionalNumberProp(node.props, "min")}
            name={name}
            onChange={onChange}
            step={getOptionalNumberProp(node.props, "step")}
            tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
            type="range"
            value={value}
          />
          <output className="w-10 shrink-0 text-right text-sm tabular-nums text-lt-fg">
            {value}
          </output>
        </div>
      ) : (
        <Input
          autoFocus={getBooleanProp(node.props, "autoFocus")}
          disabled={disabled}
          id={name}
          max={getOptionalNumberProp(node.props, "max")}
          min={getOptionalNumberProp(node.props, "min")}
          name={name}
          onChange={onChange}
          placeholder={getStringProp(node.props, "placeholder")}
          readOnly={readonly}
          step={getOptionalNumberProp(node.props, "step")}
          tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
          type="number"
          value={value}
        />
      )}
    </FormFieldFrame>
  );
};
