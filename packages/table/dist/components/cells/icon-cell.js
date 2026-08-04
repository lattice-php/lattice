import { cn } from "@lattice-php/ui/lib/utils";
import { IconRenderer } from "@lattice-php/ui/icons";
import { jsx } from "react/jsx-runtime";
import { coerceColor, toneProps } from "@lattice-php/ui/lib/color";
//#region resources/js/components/cells/icon-cell.tsx
var IconCell = ({ props, value }) => {
	const icon = props.icons?.[String(value)] ?? props.icon ?? void 0;
	if (!icon) return null;
	const color = coerceColor(props.colors?.[String(value)]);
	const tone = color ? toneProps(color) : void 0;
	return /* @__PURE__ */ jsx("span", {
		"aria-label": String(value),
		className: cn("lt-cell-icon", tone?.className),
		style: tone?.style,
		children: /* @__PURE__ */ jsx(IconRenderer, {
			className: "size-lt-icon-md",
			icon
		})
	});
};
//#endregion
export { IconCell };

//# sourceMappingURL=icon-cell.js.map