import { getColumnAriaSort, getColumnSort } from "@lattice-php/table/lib/query";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { alignJustify, alignText } from "@lattice-php/table/lib/align";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/column-header.tsx
function SortIndicator({ sort }) {
	if (sort?.direction === "asc") return /* @__PURE__ */ jsx(Icon, {
		name: "arrow-up",
		"aria-hidden": "true",
		className: "size-lt-icon-sm shrink-0"
	});
	if (sort?.direction === "desc") return /* @__PURE__ */ jsx(Icon, {
		name: "arrow-down",
		"aria-hidden": "true",
		className: "size-lt-icon-sm shrink-0"
	});
	return /* @__PURE__ */ jsx(Icon, {
		name: "chevrons-up-down",
		"aria-hidden": "true",
		className: "size-lt-icon-sm shrink-0 opacity-50"
	});
}
function ColumnHeader({ column, processing, resizeHandleProps, sort, query }) {
	const columnSort = getColumnSort(query, column);
	const { t } = useT("lattice");
	const { align, label, sortable } = column.props;
	return /* @__PURE__ */ jsxs("div", {
		"aria-sort": getColumnAriaSort(columnSort),
		className: cn("relative min-w-0 px-4 py-3 pr-5 align-middle font-semibold text-lt-fg", alignText(align)),
		role: "columnheader",
		children: [sortable ? /* @__PURE__ */ jsxs("button", {
			type: "button",
			"aria-label": t("table.sort.column", "Sort {{label}}", { label }),
			className: cn("flex w-full items-center gap-1.5 font-semibold", alignJustify(align)),
			"data-test": `sort-${column.key}`,
			disabled: processing,
			onClick: () => sort(column),
			children: [/* @__PURE__ */ jsx("span", {
				className: cn("min-w-0 flex-1 truncate", alignText(align)),
				children: label
			}), /* @__PURE__ */ jsx(SortIndicator, { sort: columnSort })]
		}) : /* @__PURE__ */ jsx("span", {
			className: cn("block truncate", alignText(align)),
			children: label
		}), resizeHandleProps && /* @__PURE__ */ jsx("div", { ...resizeHandleProps })]
	});
}
//#endregion
export { ColumnHeader };

//# sourceMappingURL=column-header.js.map