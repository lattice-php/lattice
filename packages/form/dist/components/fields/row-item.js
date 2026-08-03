import { buildRowActions } from "./row-action-menu.js";
import { RowActions } from "./row-actions.js";
import { memo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useT } from "@lattice-php/ui/i18n";
import { Icon } from "@lattice-php/ui/icons";
import { nodeKey } from "@lattice-php/core/nodes";
import { RenderNode } from "@lattice-php/core/renderer";
import { FieldScopeProvider } from "@lattice-php/form/hooks/field-scope";
//#region resources/js/components/fields/row-item.tsx
function RowButton({ label, testId, onClick, children }) {
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		"aria-label": label,
		"data-test": testId,
		className: "text-lt-muted-fg hover:text-lt-fg",
		onClick,
		children
	});
}
var RowItem = memo(function RowItem({ base, index, row, template, heading, reorderable, isFirst, isLast, removable, rowActions, onField, onRemove, onMove, onDuplicate }) {
	const { t } = useT("lattice");
	return /* @__PURE__ */ jsxs("div", {
		"data-test": `repeater-${base}-row-${index}`,
		className: "rounded-lt border border-lt-border bg-lt-surface p-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-2 flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-sm font-medium text-lt-muted-fg",
				children: heading
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1 [&_svg]:size-lt-icon-sm",
				children: [
					reorderable && !isFirst && /* @__PURE__ */ jsx(RowButton, {
						label: "Move up",
						testId: `repeater-${base}-up-${index}`,
						onClick: () => onMove(index, -1),
						children: /* @__PURE__ */ jsx(Icon, { name: "arrow-up" })
					}),
					reorderable && !isLast && /* @__PURE__ */ jsx(RowButton, {
						label: "Move down",
						testId: `repeater-${base}-down-${index}`,
						onClick: () => onMove(index, 1),
						children: /* @__PURE__ */ jsx(Icon, { name: "arrow-down" })
					}),
					/* @__PURE__ */ jsx(RowActions, { actions: buildRowActions(rowActions, {
						index,
						removable,
						onRemove,
						onDuplicate,
						t
					}) })
				]
			})]
		}), /* @__PURE__ */ jsx(FieldScopeProvider, {
			base,
			index,
			row,
			onChange: (field, value) => onField(index, field, value),
			children: /* @__PURE__ */ jsx("div", {
				className: "flex flex-col gap-4",
				children: template.map((child, childIndex) => /* @__PURE__ */ jsx(RenderNode, { node: child }, nodeKey(child, childIndex)))
			})
		})]
	});
});
//#endregion
export { RowButton, RowItem };

//# sourceMappingURL=row-item.js.map