import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Textarea } from "../base/textarea";
import { useControlledField } from "../use-controlled-field";

export const TextareaComponent: RendererComponent<"form.textarea"> = ({ node }) => {
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
      <Textarea
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        disabled={disabled}
        id={name}
        name={name}
        onChange={(event) => commit(event.target.value)}
        placeholder={getStringProp(node.props, "placeholder")}
        readOnly={readonly}
        rows={getOptionalNumberProp(node.props, "rows")}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        value={value}
      />
    </FormFieldFrame>
  );
};
