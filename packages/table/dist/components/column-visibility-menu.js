import { useT } from "@lattice-php/ui/i18n";
import { Checkbox } from "@lattice-php/ui/checkbox";
import { jsx, jsxs } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
//#region resources/js/components/column-visibility-menu.tsx
function ColumnVisibilityMenu({ columns, hasHidden, isVisible, onReset, onToggle, processing, visibleColumnCount }) {
	const { t } = useT("lattice");
	const columnsLabel = t("table.columns.label", "Columns");
	return /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsx(IconButton, {
			size: "sm",
			icon: "columns-3",
			label: columnsLabel,
			"data-test": "table-columns-menu",
			disabled: processing
		})
	}), /* @__PURE__ */ jsx(PopoverContent, {
		align: "end",
		className: "w-64 p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid gap-3",
			children: [columns.map((column) => {
				const visible = isVisible(column);
				const lockedLast = visible && visibleColumnCount <= 1;
				return /* @__PURE__ */ jsxs("label", {
					className: "flex items-center gap-2 text-base text-lt-fg",
					children: [/* @__PURE__ */ jsx(Checkbox, {
						"data-test": `table-column-toggle-${column.key}`,
						checked: visible,
						disabled: lockedLast,
						onCheckedChange: (next) => onToggle(column.key, next === true)
					}), /* @__PURE__ */ jsx("span", { children: column.props.label ?? column.key })]
				}, column.key);
			}), hasHidden && /* @__PURE__ */ jsx("button", {
				type: "button",
				"data-test": "table-columns-reset",
				className: "mt-1 justify-self-start text-sm text-lt-muted-fg hover:text-lt-fg",
				onClick: onReset,
				children: t("table.columns.reset", "Reset")
			})]
		})
	})] });
}
//#endregion
export { ColumnVisibilityMenu };

//# sourceMappingURL=column-visibility-menu.js.map