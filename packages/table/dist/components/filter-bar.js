import { TableFilterControl } from "./filter-controls.js";
import { isActiveFilterValue } from "@lattice-php/table/lib/filter-values";
import { VALUELESS_FILTER_OPERATORS, operatorLabel } from "@lattice-php/table/lib/query";
import { useT } from "@lattice-php/ui/i18n";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
//#region resources/js/components/filter-bar.tsx
function FilterBar({ clauses, columnsByKey, indicators, processing, onRemoveClause, onChange, onReset }) {
	const { t } = useT("lattice");
	if (clauses.length === 0 && indicators.length === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "border-b border-lt-border px-4 py-3",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center gap-2 text-sm",
			children: [
				clauses.map((clause, index) => {
					const label = columnsByKey.get(clause.field)?.props.label ?? clause.field;
					const valueless = VALUELESS_FILTER_OPERATORS.has(clause.operator);
					return /* @__PURE__ */ jsx(FilterChip, {
						label: `${label} ${operatorLabel(clause.operator)}`,
						value: valueless ? "" : clause.value,
						removeTestId: `filter-chip-${clause.field}-remove`,
						removeLabel: t("table.filter.remove", "Remove {{label}} filter", { label }),
						processing,
						onRemove: () => onRemoveClause(index)
					}, `${clause.field}-${clause.operator}-${index}`);
				}),
				indicators.map((indicator) => /* @__PURE__ */ jsx(FilterChip, {
					label: indicator.label,
					value: indicator.value,
					removeTestId: `table-filter-chip-${indicator.filter}-remove`,
					removeLabel: t("table.filter.remove", "Remove {{label}} filter", { label: indicator.label }),
					processing,
					onRemove: () => onChange(indicator.filter, void 0)
				}, `${indicator.filter}:${indicator.label}:${indicator.value}`)),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					"data-test": "table-filters-reset",
					className: "text-lt-muted-fg underline-offset-2 hover:underline disabled:text-lt-disabled-fg",
					disabled: processing,
					onClick: onReset,
					children: t("table.filter.reset-all", "Reset all")
				})
			]
		})
	});
}
function FilterChip({ label, value, removeTestId, removeLabel, processing, onRemove }) {
	return /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center gap-1.5 rounded-lt-sm bg-lt-muted px-2 py-1",
		children: [/* @__PURE__ */ jsx("span", { children: value === "" ? /* @__PURE__ */ jsx("span", {
			className: "font-semibold",
			children: label
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [`${label}: `, /* @__PURE__ */ jsx("span", {
			className: "font-semibold",
			children: value
		})] }) }), /* @__PURE__ */ jsx(IconButton, {
			size: "xs",
			icon: "x",
			label: removeLabel,
			"data-test": removeTestId,
			disabled: processing,
			onClick: onRemove
		})]
	});
}
function FilterMenu({ filters, values, processing, onChange, onSearch }) {
	const { t } = useT("lattice");
	const active = filters.filter((filter) => isActiveFilterValue(values[filter.key]));
	const filtersLabel = t("table.filter.filters", "Filters");
	return /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsx(IconButton, {
			size: "sm",
			icon: "filter",
			label: filtersLabel,
			"data-test": "table-filters-menu",
			disabled: processing,
			children: active.length > 0 && /* @__PURE__ */ jsx("span", {
				className: "absolute -right-1 -top-1 inline-flex size-3.5 items-center justify-center rounded-full bg-lt-primary text-[10px] font-medium leading-none text-lt-primary-fg",
				children: active.length
			})
		})
	}), /* @__PURE__ */ jsx(PopoverContent, {
		align: "end",
		className: "w-80 p-4",
		children: /* @__PURE__ */ jsx("div", {
			className: "grid gap-3",
			children: filters.map((filter) => /* @__PURE__ */ jsx("div", {
				className: "grid gap-1",
				children: /* @__PURE__ */ jsx(TableFilterControl, {
					filter,
					value: values[filter.key],
					processing,
					onChange: (value) => onChange(filter.key, value),
					onSearch: onSearch ? (field, query, signal) => onSearch(`filter:${filter.key}.${field}`, query, signal) : void 0
				})
			}, filter.key))
		})
	})] });
}
//#endregion
export { FilterBar, FilterMenu };

//# sourceMappingURL=filter-bar.js.map