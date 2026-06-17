import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { AffixGroup } from "../base/affix-group";
import { Input } from "../base/input";
import { SimpleField } from "./simple-field";

export const NumberInputComponent: RendererComponent<"field.number-input"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit }) => {
        const onChange = (event: React.ChangeEvent<HTMLInputElement>): void =>
          commit(event.target.value);

        return props.slider ? (
          <div className="flex items-center gap-3">
            <input
              aria-label={props.label ?? ""}
              className="h-2 w-full cursor-pointer appearance-none rounded-lt-sm bg-lt-muted accent-lt-primary disabled:cursor-not-allowed disabled:opacity-50"
              data-test={testId}
              disabled={disabled || readOnly}
              id={name}
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
          <AffixGroup prefix={props.prefix} suffix={props.suffix}>
            {(controlClassName) => (
              <Input
                autoFocus={props.autoFocus ?? false}
                className={controlClassName}
                data-test={testId}
                disabled={disabled}
                id={name}
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
