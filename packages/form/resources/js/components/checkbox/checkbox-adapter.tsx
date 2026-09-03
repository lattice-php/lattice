import type { RendererComponent } from "@lattice-php/core";
import { Checkbox } from "./checkbox";
import { Label } from "../../primitives/label";
import { toBoolean } from "../../lib/conditions";
import { useControlledField } from "../../hooks/use-controlled-field";
import { useSeedDefault } from "../../hooks/use-seed-default";

export const CheckboxAdapter: RendererComponent<"field.checkbox"> = ({ node }) => {
  const field = useControlledField(node);
  const checked = toBoolean(field.rawValue);

  useSeedDefault(field.localName, toBoolean(node.props.value));

  if (field.hidden) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center space-x-3">
        <Checkbox
          aria-readonly={field.readOnly && !field.disabled ? true : undefined}
          autoFocus={node.props.autoFocus ?? undefined}
          checked={checked}
          data-test={field.testId}
          disabled={field.disabled}
          id={field.name}
          name={field.name}
          onCheckedChange={(next) => {
            if (field.readOnly) {
              return;
            }

            field.commit(next === true);
          }}
          tabIndex={node.props.tabIndex ?? undefined}
        />
        <Label htmlFor={field.name}>{node.props.label}</Label>
      </div>
      {node.props.helperText && (
        <p className="mt-1 pl-7 text-sm text-lt-muted-fg">{node.props.helperText}</p>
      )}
    </div>
  );
};
