import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { Input } from "../base/input";
import { useFormContext } from "../context";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.text-input": {
      autoComplete?: string;
      autoFocus?: boolean;
      label?: string;
      name?: string;
      placeholder?: string;
      readOnly?: boolean;
      required?: boolean;
      tabIndex?: number;
      type?: "email" | "text";
      value?: string;
    };
  }
}

export const TextInputComponent: RendererComponent<"form.text-input"> = ({ node }) => {
  const { errors } = useFormContext();
  const name = getStringProp(node.props, "name");

  return (
    <FormFieldFrame error={errors[name]} label={getStringProp(node.props, "label")} name={name}>
      <Input
        autoComplete={getStringProp(node.props, "autoComplete")}
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        defaultValue={getStringProp(node.props, "value") || undefined}
        id={name}
        name={name}
        placeholder={getStringProp(node.props, "placeholder")}
        readOnly={getBooleanProp(node.props, "readOnly")}
        required={getBooleanProp(node.props, "required")}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        type={getStringProp(node.props, "type", "text")}
      />
    </FormFieldFrame>
  );
};
