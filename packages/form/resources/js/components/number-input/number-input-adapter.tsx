import type { RendererComponent } from "@lattice-php/core";
import { AffixGroup } from "../../primitives/affix-group";
import { Input } from "../../primitives/input";
import { AffixSelect, affixFieldNode } from "../base/affix-select";
import { SimpleField } from "../base/simple-field";

export const NumberInputAdapter: RendererComponent<"field.number-input"> = ({ node }) => {
  const props = node.props;
  const prefixFieldNode = affixFieldNode(node, props.prefixFieldName);
  const suffixFieldNode = affixFieldNode(node, props.suffixFieldName);

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }, controlProps) => {
        const onChange = (event: React.ChangeEvent<HTMLInputElement>): void =>
          commit(event.target.value);

        return props.slider ? (
          <div className="flex items-center gap-3">
            <input
              {...controlProps}
              aria-label={props.label ?? ""}
              className="h-2 w-full cursor-pointer appearance-none rounded-lt-sm bg-lt-muted accent-lt-primary disabled:cursor-not-allowed disabled:accent-lt-disabled"
              data-test={testId}
              disabled={disabled || readOnly}
              max={props.max ?? undefined}
              min={props.min ?? undefined}
              name={name}
              onChange={onChange}
              step={props.step ?? undefined}
              tabIndex={props.tabIndex ?? undefined}
              type="range"
              value={value}
            />
            <output className="w-10 shrink-0 text-right text-sm tabular-nums text-lt-fg">
              {value}
            </output>
          </div>
        ) : (
          <AffixGroup
            prefix={prefixFieldNode ? null : props.prefix}
            suffix={suffixFieldNode ? null : props.suffix}
            start={
              prefixFieldNode ? <AffixSelect node={prefixFieldNode} side="start" /> : undefined
            }
            end={suffixFieldNode ? <AffixSelect node={suffixFieldNode} side="end" /> : undefined}
          >
            {(controlClassName) => (
              <Input
                {...controlProps}
                autoFocus={props.autoFocus ?? false}
                className={controlClassName}
                data-test={testId}
                disabled={disabled}
                max={props.max ?? undefined}
                min={props.min ?? undefined}
                name={name}
                onChange={onChange}
                placeholder={props.placeholder ?? ""}
                readOnly={readOnly}
                step={props.step ?? undefined}
                tabIndex={props.tabIndex ?? undefined}
                type="number"
                value={value}
              />
            )}
          </AffixGroup>
        );
      }}
    </SimpleField>
  );
};
