import type { RendererComponent } from "@lattice-php/core";
import { toBoolean } from "../../lib/conditions";
import { useSeedDefault } from "../../hooks/use-seed-default";
import { SimpleField } from "../base/simple-field";
import { Toggle } from "./toggle";

export const ToggleAdapter: RendererComponent<"field.toggle"> = ({ node }) => {
  const props = node.props;

  useSeedDefault(props.name, toBoolean(props.value));

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, rawValue, readOnly, disabled, commit }, controlProps) => {
        const checked = toBoolean(rawValue);
        const locked = readOnly || disabled;

        return (
          <>
            <input disabled={locked} name={name} type="hidden" value={checked ? "1" : "0"} />
            <Toggle
              {...controlProps}
              aria-label={props.label ?? props.name}
              aria-readonly={readOnly && !disabled ? true : undefined}
              autoFocus={props.autoFocus ?? false}
              checked={checked}
              data-test={testId}
              disabled={disabled}
              name={name}
              onCheckedChange={(next) => {
                if (!readOnly) {
                  commit(next);
                }
              }}
              tabIndex={props.tabIndex ?? undefined}
            />
          </>
        );
      }}
    </SimpleField>
  );
};
