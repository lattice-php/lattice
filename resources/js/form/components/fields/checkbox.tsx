import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import { Checkbox } from "../base/checkbox";
import { Label } from "../base/label";
import { toBoolean } from "../conditions";
import { useFieldScope } from "../field-scope";
import { useDependentField } from "../use-dependent-field";
import { useFieldCommit } from "../use-field-commit";
import { useSeedDefault } from "../use-seed-default";
import { useFormValue } from "../values";

export const CheckboxComponent: RendererComponent<"form.checkbox"> = ({ node }) => {
  const { hidden, readOnly, disabled } = useDependentField(node);
  const localName = node.props.name;
  const scope = useFieldScope();
  const name = scope ? scope.scopedName(localName) : localName;
  const globalValue = useFormValue(localName);
  const storedValue = scope ? scope.getValue(localName) : globalValue;
  const { commit } = useFieldCommit();
  const defaultChecked = toBoolean(node.props.value);
  const checked = storedValue !== undefined ? toBoolean(storedValue) : defaultChecked;

  useSeedDefault(localName, defaultChecked);

  if (hidden) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center space-x-3">
        <Checkbox
          autoFocus={node.props.autoFocus ?? undefined}
          checked={checked}
          data-test={testIdentity(localName)}
          disabled={readOnly || disabled}
          id={name}
          name={name}
          onCheckedChange={(next) => {
            commit(localName, next === true);
          }}
          tabIndex={node.props.tabIndex ?? undefined}
        />
        <Label htmlFor={name}>{node.props.label}</Label>
      </div>
      {node.props.helperText && (
        <p className="mt-1 pl-7 text-sm text-lt-muted-fg">{node.props.helperText}</p>
      )}
    </div>
  );
};
