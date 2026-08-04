import { jsx } from "react/jsx-runtime";
import { Badge } from "@lattice-php/ui/badge";
import { formatCell } from "@lattice-php/table/lib/format";
//#region resources/js/components/cells/badge-cell.tsx
var BadgeCell = ({ column, props, value }) => {
	const label = formatCell(value, column);
	if (label === "") return null;
	return /* @__PURE__ */ jsx(Badge, {
		color: props.colors?.[String(value)],
		children: label
	});
};
//#endregion
export { BadgeCell };

//# sourceMappingURL=badge-cell.js.map