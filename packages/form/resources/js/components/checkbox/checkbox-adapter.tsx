import type { RendererComponent } from "@lattice-php/core";
import { Checkbox } from "./checkbox";
import { Label } from "@lattice-php/form/primitives/label";
import { toBoolean } from "@lattice-php/form/lib/conditions";
import { useControlledField } from "@lattice-php/form/hooks/use-controlled-field";
import { useSeedDefault } from "@lattice-php/form/hooks/use-seed-default";

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
          autoFocus={node.props.autoFocus ?? undefined}
          checked={checked}
          data-test={field.testId}
          disabled={field.readOnly || field.disabled}
          id={field.name}
          name={field.name}
          onCheckedChange={(next) => {
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
