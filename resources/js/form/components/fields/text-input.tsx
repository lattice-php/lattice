import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { AffixGroup } from "../base/affix-group";
import { Input } from "../base/input";
import { SimpleField } from "./simple-field";

export const TextInputComponent: RendererComponent<"field.text-input"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }) => (
        <AffixGroup prefix={props.prefix} suffix={props.suffix}>
          {(controlClassName) => (
            <Input
              autoComplete={props.autoComplete ?? ""}
              autoFocus={props.autoFocus ?? false}
              className={controlClassName}
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
        </AffixGroup>
      )}
    </SimpleField>
  );
};
