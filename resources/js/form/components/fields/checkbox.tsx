import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@/lattice/core/props";
import type { RendererComponent } from "@/lattice/core/types";
import { Checkbox } from "../base/checkbox";
import { Label } from "../base/label";

declare module "@/lattice/core/types" {
  interface ComponentProps {
    "form.checkbox": {
      label?: string;
      name?: string;
      required?: boolean;
      tabIndex?: number;
    };
  }
}

export const CheckboxComponent: RendererComponent<"form.checkbox"> = ({ node }) => {
  const name = getStringProp(node.props, "name");

  return (
    <div className="flex items-center space-x-3">
      <Checkbox
        id={name}
        name={name}
        required={getBooleanProp(node.props, "required")}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
      />
      <Label htmlFor={name}>{getStringProp(node.props, "label")}</Label>
    </div>
  );
};
