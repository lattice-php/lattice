import type { RendererComponent } from "@lattice-php/core";
import { useFieldScope } from "../../hooks/field-scope";

export const HiddenInputAdapter: RendererComponent<"field.hidden-input"> = ({ node }) => {
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
