import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useControlledField } from "../use-controlled-field";

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
