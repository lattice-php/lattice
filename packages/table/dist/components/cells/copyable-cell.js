import { jsx } from "react/jsx-runtime";
import { CopyableText } from "@lattice-php/ui/copyable-text";
//#region resources/js/components/cells/copyable-cell.tsx
/** Wrap cell content in a copy-to-clipboard affordance when `copyable` is set. */
function CopyableCell({ children, column, copyable, value }) {
	if (!copyable) return children;
	return /* @__PURE__ */ jsx(CopyableText, {
		value,
		label: column.props.label ?? column.key,
		testId: `copy-${column.key}`,
		children
	});
}
//#endregion
export { CopyableCell };

//# sourceMappingURL=copyable-cell.js.map