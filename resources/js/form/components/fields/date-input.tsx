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
    <FormFieldFrame error={error} label={node.props.label ?? ""} name={name} required={required}>
      <Input
        autoFocus={node.props.autoFocus ?? false}
        disabled={disabled}
        id={name}
        max={node.props.max || undefined}
        min={node.props.min || undefined}
        name={name}
        onChange={(event) => commit(event.target.value)}
        readOnly={readonly}
        tabIndex={node.props.tabIndex ?? undefined}
        type="date"
        value={value}
      />
    </FormFieldFrame>
  );
};
