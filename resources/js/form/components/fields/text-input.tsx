import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useControlledField } from "../use-controlled-field";

export const TextInputComponent: RendererComponent<"form.text-input"> = ({ node }) => {
  const props = node.props;
  const { name, value, error, hidden, required, readonly, disabled, commit } =
    useControlledField(node);

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame error={error} label={props.label ?? ""} name={name} required={required}>
      <Input
        autoComplete={props.autoComplete ?? ""}
        autoFocus={props.autoFocus ?? false}
        disabled={disabled}
        id={name}
        name={name}
        onChange={(event) => commit(event.target.value)}
        placeholder={props.placeholder ?? ""}
        readOnly={readonly}
        tabIndex={props.tabIndex ?? undefined}
        type={props.type ?? "text"}
        value={value}
      />
    </FormFieldFrame>
  );
};
