import "react";
import { jsx } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
//#region resources/js/rich-editor/toolbar-button.tsx
/**
* The shared editor toolbar trigger: an {@link IconButton} that keeps focus in
* the editor (mousedown is prevented so clicks don't blur it, which would
* otherwise trigger a precognition request).
*/
function ToolbarIconButton({ active = false, icon, label, testId, ...props }) {
	return /* @__PURE__ */ jsx(IconButton, {
		size: "sm",
		icon,
		label,
		title: label,
		active,
		"data-test": testId,
		...props,
		onMouseDown: (event) => {
			event.preventDefault();
			props.onMouseDown?.(event);
		}
	});
}
//#endregion
export { ToolbarIconButton };

//# sourceMappingURL=toolbar-button.js.map