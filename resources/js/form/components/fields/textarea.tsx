import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Textarea } from "../base/textarea";
import { SimpleField } from "./simple-field";

export const TextareaComponent: RendererComponent<"field.textarea"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }) => (
        <Textarea
          autoFocus={props.autoFocus ?? false}
          data-test={testId}
          disabled={disabled}
          id={name}
          name={name}
          onChange={(event) => commit(event.target.value)}
          placeholder={props.placeholder ?? ""}
          readOnly={readOnly}
          rows={props.rows ?? undefined}
          tabIndex={props.tabIndex ?? undefined}
          value={value}
        />
      )}
    </SimpleField>
  );
};
