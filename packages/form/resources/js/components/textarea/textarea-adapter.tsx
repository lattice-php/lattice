import type { RendererComponent } from "@lattice-php/core";
import { Textarea } from "./textarea";
import { SimpleField } from "../fields/simple-field";

export const TextareaAdapter: RendererComponent<"field.textarea"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }, controlProps) => (
        <Textarea
          {...controlProps}
          autoFocus={props.autoFocus ?? false}
          data-test={testId}
          disabled={disabled}
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
