import type { RendererComponent } from "@lattice/lattice/core/types";
import { Input } from "../base/input";
import { SimpleField } from "./simple-field";

export const TextInputComponent: RendererComponent<"form.text-input"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, value, readonly, disabled, commit }) => (
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
      )}
    </SimpleField>
  );
};
