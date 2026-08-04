import "react";
import { jsx } from "react/jsx-runtime";
import { cn } from "@lattice-php/ui/lib/utils";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
//#region resources/js/badge.tsx
function Badge({ color, className, style, ...props }) {
	const tone = toneProps(coerceColor(color ?? void 0) ?? namedColor("gray"));
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "badge",
		className: cn("lt-badge", tone.className, className),
		style: {
			...tone.style,
			...style
		},
		...props
	});
}
var BadgeComponent = ({ node }) => /* @__PURE__ */ jsx(Badge, {
	color: node.props.color,
	children: node.props.label
});
//#endregion
export { Badge, BadgeComponent as default };

//# sourceMappingURL=badge.js.map