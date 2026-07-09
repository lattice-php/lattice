import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useFieldScope } from "../../hooks/field-scope";

export const HiddenInputComponent: RendererComponent<"field.hidden-input"> = ({ node }) => {
  const scope = useFieldScope();
  const name = node.props.name;
  const value = scope ? scope.getValue(name) : node.props.value;

  return (
    <input
      defaultValue={typeof value === "string" ? value : ""}
      name={scope ? scope.scopedName(name) : name}
      type="hidden"
    />
  );
};
