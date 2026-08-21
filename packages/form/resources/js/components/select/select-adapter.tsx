import type { RendererComponent } from "@lattice-php/core";
import { FormFieldFrame } from "../base/field";
import { fieldLabelAction } from "../base/label-action";
import { useFormContext } from "../../hooks/context";
import { useDependentField } from "../../hooks/use-dependent-field";
import { useFieldScope } from "../../hooks/field-scope";
import { SelectControl, useSelectDomName } from "./select-control";

export const SelectAdapter: RendererComponent<"field.select"> = ({ node }) => {
  const props = node.props;
  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const scope = useFieldScope();
  const domName = useSelectDomName(props.name);
  const errorKey = scope ? scope.errorKey(props.name) : props.name;

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={errors[errorKey]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      labelAction={fieldLabelAction(props.labelAction)}
      label={props.label ?? ""}
      id={domName}
      required={required}
    >
      {(controlProps) => <SelectControl controlProps={controlProps} node={node} />}
    </FormFieldFrame>
  );
};
