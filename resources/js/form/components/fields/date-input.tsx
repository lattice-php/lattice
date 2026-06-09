import {
  getBooleanProp,
  getOptionalNumberProp,
  getStringProp,
} from "@bambamboole/lattice/core/props";
import type { RendererComponent } from "@bambamboole/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useControlledField } from "../use-controlled-field";

declare module "@bambamboole/lattice/core/types" {
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
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        disabled={disabled}
        id={name}
        max={getStringProp(node.props, "max") || undefined}
        min={getStringProp(node.props, "min") || undefined}
        name={name}
        onChange={(event) => commit(event.target.value)}
        readOnly={readonly}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        type="date"
        value={value}
      />
    </FormFieldFrame>
  );
};
