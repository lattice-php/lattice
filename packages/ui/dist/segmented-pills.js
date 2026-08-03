import { cn } from "./lib/utils.js";
import { pillClassName } from "./pill.js";
import { useEffect, useRef } from "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/segmented-pills.tsx
/**
* Presentational segmented pill group. Used by the form choice field (bound to a
* form value) and the core segmented control (standalone, emits an event).
*/
function SegmentedPills({ ariaLabel, autoFocus = false, className, disabled = false, name, onSelect, options, tabIndex, value, ...props }) {
	const groupRef = useRef(null);
	useEffect(() => {
		if (!autoFocus) return;
		const group = groupRef.current;
		(group?.querySelector("button[aria-checked=\"true\"]") ?? group?.querySelector("button"))?.focus();
	}, [autoFocus]);
	return /* @__PURE__ */ jsx("div", {
		...props,
		"aria-label": ariaLabel,
		className: cn("inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1", className),
		ref: groupRef,
		role: "radiogroup",
		children: options.map((option) => {
			const isSelected = value === option.value;
			return /* @__PURE__ */ jsx("button", {
				"aria-checked": isSelected,
				"data-test": `${name}-${option.value}`,
				className: cn(pillClassName(isSelected), disabled && "cursor-not-allowed opacity-60"),
				disabled,
				onClick: () => onSelect(option.value),
				role: "radio",
				tabIndex,
				type: "button",
				children: option.label
			}, option.value);
		})
	});
}
//#endregion
export { SegmentedPills };

//# sourceMappingURL=segmented-pills.js.map