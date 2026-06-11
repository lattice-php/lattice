import type { RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useControlledField } from "../use-controlled-field";

export const NumberInputComponent: RendererComponent<"form.number-input"> = ({ node }) => {
  const { name, value, error, hidden, required, readonly, disabled, commit } =
    useControlledField(node);

  if (hidden) {
    return null;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => commit(event.target.value);

  return (
    <FormFieldFrame error={error} label={node.props.label ?? ""} name={name} required={required}>
      {node.props.slider ? (
        <div className="flex items-center gap-3">
          <input
            aria-label={node.props.label ?? ""}
            className="h-2 w-full cursor-pointer appearance-none rounded-lt-sm bg-lt-muted accent-lt-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || readonly}
            id={name}
            max={node.props.max ?? undefined}
            min={node.props.min ?? undefined}
            name={name}
            onChange={onChange}
            step={node.props.step ?? undefined}
            tabIndex={node.props.tabIndex ?? undefined}
            type="range"
            value={value}
          />
          <output className="w-10 shrink-0 text-right text-sm tabular-nums text-lt-fg">
            {value}
          </output>
        </div>
      ) : (
        <Input
          autoFocus={node.props.autoFocus ?? false}
          disabled={disabled}
          id={name}
          max={node.props.max ?? undefined}
          min={node.props.min ?? undefined}
          name={name}
          onChange={onChange}
          placeholder={node.props.placeholder ?? ""}
          readOnly={readonly}
          step={node.props.step ?? undefined}
          tabIndex={node.props.tabIndex ?? undefined}
          type="number"
          value={value}
        />
      )}
    </FormFieldFrame>
  );
};
