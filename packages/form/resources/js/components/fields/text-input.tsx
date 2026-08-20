import type { RendererComponent } from "@lattice-php/core";
import { AffixGroup } from "@lattice-php/ui/primitives/affix-group";
import { CopyButton } from "@lattice-php/ui/primitives/copyable-text";
import { Input } from "@lattice-php/ui/primitives/input";
import { AffixSelect, affixFieldNode } from "./affix-select";
import { SimpleField } from "./simple-field";

export const TextInputComponent: RendererComponent<"field.text-input"> = ({ node }) => {
  const props = node.props;
  const prefixFieldNode = affixFieldNode(node, props.prefixFieldName);
  const suffixFieldNode = affixFieldNode(node, props.suffixFieldName);

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }, controlProps) => (
        <AffixGroup
          prefix={prefixFieldNode ? null : props.prefix}
          suffix={suffixFieldNode ? null : props.suffix}
          start={prefixFieldNode ? <AffixSelect node={prefixFieldNode} side="start" /> : undefined}
          end={
            suffixFieldNode || props.copyable ? (
              <>
                {suffixFieldNode ? (
                  <AffixSelect node={suffixFieldNode} side="end" last={!props.copyable} />
                ) : null}
                {props.copyable ? (
                  <CopyButton
                    className="h-lt-control-md gap-1.5 rounded-l-none rounded-r-lt-sm border-l-0 border-lt-input px-3 group-has-[:focus-visible]:border-lt-ring"
                    label={props.label ?? name}
                    testId={`${testId}-copy`}
                    value={value}
                  />
                ) : null}
              </>
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
