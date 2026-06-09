import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useControlledField } from "../use-controlled-field";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    "form.text-input": {
      autoComplete?: string;
      autoFocus?: boolean;
      conditions?: unknown;
      disabled?: boolean;
      hidden?: boolean;
      label?: string;
      name?: string;
      placeholder?: string;
      readonly?: boolean;
      required?: boolean;
      tabIndex?: number;
      type?: "email" | "text";
      value?: string;
    };
  }
}

export const TextInputComponent: RendererComponent<"form.text-input"> = ({ node }) => {
  const { name, value, error, hidden, required, readonly, disabled, commit } =
    useControlledField(node);

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={error}
      label={getStringProp(node.props, "label")}
      name={name}
      required={required}
    >
      <Input
        autoComplete={getStringProp(node.props, "autoComplete")}
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        disabled={disabled}
        id={name}
        name={name}
        onChange={(event) => commit(event.target.value)}
        placeholder={getStringProp(node.props, "placeholder")}
        readOnly={readonly}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        type={getStringProp(node.props, "type", "text")}
        value={value}
      />
    </FormFieldFrame>
  );
};
