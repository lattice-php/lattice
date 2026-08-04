import { Renderer } from "@lattice-php/core/renderer";
import { jsx } from "react/jsx-runtime";
import { materializeSchema } from "@lattice-php/core/materialize";
//#region resources/js/components/cells/stack-cell.tsx
var StackCell = ({ column, row }) => /* @__PURE__ */ jsx("div", {
	className: "grid gap-1",
	children: /* @__PURE__ */ jsx(Renderer, { nodes: materializeSchema(column.schema, row) })
});
//#endregion
export { StackCell };

//# sourceMappingURL=stack-cell.js.map