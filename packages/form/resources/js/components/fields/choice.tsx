import { useMemo } from "react";
import type { Option, RendererComponent } from "@lattice-php/core";
import { OptionCards } from "@lattice-php/ui/primitives/option-cards";
import { SegmentedControl } from "@lattice-php/ui/components/segmented-control/segmented-control";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { fieldLabelAction } from "@lattice-php/form/components/base/label-action";
import { useControlledField } from "@lattice-php/form/hooks/use-controlled-field";
import { useResolvedNode } from "@lattice-php/form/hooks/resolved-nodes";
import { useSeedDefault } from "@lattice-php/form/hooks/use-seed-default";

export const ChoiceComponent: RendererComponent<"field.choice"> = ({ node }) => {
  const resolvedNode = useResolvedNode(node);
  const { localName, name, testId, value, error, hidden, required, readOnly, disabled, commit } =
    useControlledField(node);
  const options = useMemo(
    () => (resolvedNode.props as { options?: Option[] }).options ?? [],
    [resolvedNode.props],
  );
  const optionSchema = resolvedNode.props.optionSchema;
  const fallbackValue = options[0]?.value ?? "";
  const selected = value || fallbackValue;

  useSeedDefault(localName, selected || undefined);

  if (hidden || options.length === 0) {
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
      {(controlProps) => (
        <>
          <input name={name} type="hidden" value={selected} />
          {optionSchema?.length ? (
            <OptionCards
              {...controlProps}
              ariaLabel={node.props.label ?? undefined}
              autoFocus={node.props.autoFocus ?? undefined}
              disabled={readOnly || disabled}
              name={testId ?? "choice"}
              onSelect={commit}
              optionSchema={optionSchema}
              options={options}
              tabIndex={node.props.tabIndex ?? undefined}
              value={selected}
            />
          ) : (
            <SegmentedControl
              {...controlProps}
              aria-label={node.props.label ?? undefined}
              autoFocus={node.props.autoFocus ?? undefined}
              disabled={readOnly || disabled}
              name={testId ?? "segment"}
              onValueChange={commit}
              options={options}
              tabIndex={node.props.tabIndex ?? undefined}
              value={selected}
            />
          )}
        </>
      )}
    </FormFieldFrame>
  );
};
