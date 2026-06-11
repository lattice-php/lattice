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
    <FormFieldFrame error={error} label={node.props.label ?? ""} name={name} required={required}>
      <Textarea
        autoFocus={node.props.autoFocus ?? false}
        disabled={disabled}
        id={name}
        name={name}
        onChange={(event) => commit(event.target.value)}
        placeholder={node.props.placeholder ?? ""}
        readOnly={readonly}
        rows={node.props.rows ?? undefined}
        tabIndex={node.props.tabIndex ?? undefined}
        value={value}
      />
    </FormFieldFrame>
  );
};
