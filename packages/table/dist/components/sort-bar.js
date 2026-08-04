import { getSortDirectionLabel } from "@lattice-php/table/lib/query";
import { useT } from "@lattice-php/ui/i18n";
import { Icon } from "@lattice-php/ui/icons";
import { jsx, jsxs } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
//#region resources/js/components/sort-bar.tsx
function SortBar({ columnsByKey, query, processing, onClear }) {
	const { t } = useT("lattice");
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm",
		children: query.sorts.map((sort, index) => {
			const label = columnsByKey.get(sort.key)?.props.label ?? sort.key;
			const arrow = sort.direction === "desc" ? "arrow-down" : "arrow-up";
			return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "font-medium",
						children: `${index + 1}. ${label}`
					}),
					/* @__PURE__ */ jsx(Icon, {
						name: arrow,
						role: "img",
						"aria-hidden": false,
						"aria-label": getSortDirectionLabel(sort.direction),
						className: "size-lt-icon-sm text-lt-muted-fg"
					}),
					/* @__PURE__ */ jsx(IconButton, {
						size: "xs",
						icon: "x",
						label: t("table.sort.clear", "Clear {{label}} sort", { label }),
						"data-test": `clear-${sort.key}-sort`,
						disabled: processing,
						onClick: () => onClear(sort)
					})
				]
			}, sort.key);
		})
	});
}
//#endregion
export { SortBar };

//# sourceMappingURL=sort-bar.js.map