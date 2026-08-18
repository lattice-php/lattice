import type { RendererComponent } from "@lattice-php/core";
import { AffixGroup } from "@lattice-php/ui/primitives/affix-group";
import { CopyButton } from "@lattice-php/ui/primitives/copyable-text";
import { Input } from "@lattice-php/ui/primitives/input";
import { SimpleField } from "./simple-field";

export const TextInputComponent: RendererComponent<"field.text-input"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }, controlProps) => (
        <AffixGroup
          prefix={props.prefix}
          suffix={props.suffix}
          end={
            props.copyable ? (
              <CopyButton
                className="h-lt-control-md gap-1.5 rounded-l-none rounded-r-lt-sm border-l-0 border-lt-input px-3 group-has-[:focus-visible]:border-lt-ring"
                label={props.label ?? name}
                testId={`${testId}-copy`}
                value={value}
              />
            ) : null
          }
        >
          {(controlClassName) => (
            <Input
              {...controlProps}
              autoComplete={props.autoComplete ?? ""}
              autoFocus={props.autoFocus ?? false}
              className={controlClassName}
              data-test={testId}
              disabled={disabled}
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
