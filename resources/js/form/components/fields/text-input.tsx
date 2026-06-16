import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Input } from "../base/input";
import { SimpleField } from "./simple-field";

export const TextInputComponent: RendererComponent<"field.text-input"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }) => (
        <Input
          autoComplete={props.autoComplete ?? ""}
          autoFocus={props.autoFocus ?? false}
          data-test={testId}
          disabled={disabled}
          id={name}
          name={name}
          onChange={(event) => commit(event.target.value)}
          placeholder={props.placeholder ?? ""}
          readOnly={readOnly}
          tabIndex={props.tabIndex ?? undefined}
          type={props.type ?? "text"}
          value={value}
        />
      )}
    </SimpleField>
  );
};
