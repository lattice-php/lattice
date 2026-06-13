import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Input } from "../base/input";
import { SimpleField } from "./simple-field";

export const DateInputComponent: RendererComponent<"form.date-input"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, value, readOnly, disabled, commit }) => (
        <Input
          autoFocus={props.autoFocus ?? false}
          disabled={disabled}
          id={name}
          max={props.max || undefined}
          min={props.min || undefined}
          name={name}
          onChange={(event) => commit(event.target.value)}
          readOnly={readOnly}
          tabIndex={props.tabIndex ?? undefined}
          type="date"
          value={value}
        />
      )}
    </SimpleField>
  );
};
