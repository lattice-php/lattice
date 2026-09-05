import { useMemo } from "react";
import type { Option, RendererComponent } from "@lattice-php/core";
import type { GridBreakpointMap } from "@lattice-php/ui/components/grid/grid";
import { CheckboxGroup } from "./checkbox-group";
import { FormFieldFrame } from "../base/field";
import { fieldLabelAction } from "../base/label-action";
import { useControlledField } from "../../hooks/use-controlled-field";
import { useResolvedNode } from "../../hooks/resolved-nodes";
import { useSeedDefault } from "../../hooks/use-seed-default";

function toValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return value === undefined || value === null || value === "" ? [] : [String(value)];
}

export const CheckboxGroupAdapter: RendererComponent<"field.checkbox-group"> = ({ node }) => {
  const resolvedNode = useResolvedNode(node);
  const { localName, name, testId, rawValue, error, hidden, required, readOnly, disabled, commit } =
    useControlledField(node);
  const options = useMemo(
    () => (resolvedNode.props as { options?: Option[] }).options ?? [],
    [resolvedNode.props],
  );
  const selected = toValues(rawValue);

  useSeedDefault(localName, toValues(node.props.value));

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={error}
      helperText={node.props.helperText ?? undefined}
      tooltip={node.props.tooltip ?? undefined}
      labelAction={fieldLabelAction(node.props.labelAction)}
      label={node.props.label ?? ""}
      id={name}
      required={required}
    >
      {({ id, ...controlProps }) => (
        <>
          {selected.map((value) => (
            <input key={value} name={`${id}[]`} type="hidden" value={value} />
          ))}
          <div {...controlProps} id={id} role="group">
            <CheckboxGroup
              bulkToggleable={node.props.bulkToggleable}
              collapsed={node.props.collapsed}
              collapsible={node.props.collapsible}
              columns={(node.props.columns ?? undefined) as GridBreakpointMap | undefined}
              disabled={disabled}
              idPrefix={id}
              onChange={commit}
              options={options}
              readOnly={readOnly}
              testId={testId ?? "checkbox-group"}
              value={selected}
            />
          </div>
        </>
      )}
    </FormFieldFrame>
  );
};
