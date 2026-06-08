import { getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { Checkbox } from "../base/checkbox";
import { Label } from "../base/label";
import { useFormContext, useFormFieldValue } from "../context";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.checkbox": {
      label?: string;
      name?: string;
      checked?: boolean;
      required?: boolean;
      tabIndex?: number;
    };
  }
}

export const CheckboxComponent: RendererComponent<"form.checkbox"> = ({ node }) => {
  const { clearErrors, precognitive, validate } = useFormContext();
  const name = getStringProp(node.props, "name");
  const stateValue = useFormFieldValue(name);
  const checked =
    typeof node.props?.checked === "boolean"
      ? node.props.checked
      : stateValue === true || stateValue === "true" || stateValue === "1" || stateValue === 1;

  return (
    <div className="flex items-center space-x-3">
      <Checkbox
        defaultChecked={checked}
        id={name}
        name={name}
        onCheckedChange={
          precognitive
            ? () => window.requestAnimationFrame(() => validate(name))
            : () => clearErrors(name)
        }
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
      />
      <Label htmlFor={name}>{getStringProp(node.props, "label")}</Label>
    </div>
  );
};
