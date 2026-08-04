import { TableFilterControl } from "./filter-controls.js";
import { FilterValueInput } from "./filter-value-input.js";
import { useState } from "react";
import { filterValue } from "@lattice-php/table/lib/filter-values";
import { VALUELESS_FILTER_OPERATORS, operatorLabel } from "@lattice-php/table/lib/query";
import { useT } from "@lattice-php/ui/i18n";
import { Button } from "@lattice-php/ui/button";
import { jsx, jsxs } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
import { NativeSelect } from "@lattice-php/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
//#region resources/js/components/column-filter-control.tsx
function ColumnFilterControl({ column, clauses, processing, onAdd, onUpdate, onRemove, onReplace, onSearch }) {
	const { t } = useT("lattice");
	const { filter, label: rawLabel } = column.props;
	const label = rawLabel ?? column.key;
	if (!filter) return null;
	if (filter.control === "filter.select") return /* @__PURE__ */ jsx(ColumnSelectFilter, {
		column,
		clauses,
		processing,
		onReplace,
		onSearch
	});
	const type = filter.type ?? "text";
	const operators = filter.operators ?? [];
	const defaultOperator = filter.defaultOperator ?? operators[0] ?? "eq";
	const primary = clauses.find((entry) => entry.clause.operator === defaultOperator) ?? clauses[0];
	function commitPrimary(value) {
		if (value === "") {
			if (primary) onRemove(primary.index);
			return;
		}
		if (primary) onUpdate(primary.index, {
			...primary.clause,
			value
		});
		else onAdd({
			field: column.key,
			operator: defaultOperator,
			value
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-w-0 max-w-80 items-stretch",
		children: [/* @__PURE__ */ jsx("div", {
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ jsx(FilterValueInput, {
				type,
				label,
				value: primary?.clause.value ?? "",
				processing,
				withSearchIcon: type === "text" || type === "number",
				grouped: true,
				testId: `filter-${column.key}-value`,
				onCommit: commitPrimary,
				onClear: primary ? () => onRemove(primary.index) : void 0
			})
		}), /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsx(IconButton, {
				emphasis: "segmented",
				size: "md",
				icon: "filter",
				label: t("table.filter.column-filters", "{{label}} filters", { label }),
				"data-test": `filter-${column.key}`,
				disabled: processing,
				children: clauses.length > 0 && /* @__PURE__ */ jsx("span", {
					className: "absolute -right-1.5 -top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-lt-primary text-xs font-medium text-lt-primary-fg",
					children: clauses.length
				})
			})
		}), /* @__PURE__ */ jsx(PopoverContent, {
			align: "start",
			className: "w-80 p-4",
			children: /* @__PURE__ */ jsx(FilterClauseList, {
				column,
				clauses,
				operators,
				defaultOperator,
				processing,
				onAdd,
				onUpdate,
				onRemove
			})
		})] })]
	});
}
function serializeColumnValue(value) {
	if (Array.isArray(value)) return value.join(",");
	return typeof value === "string" ? value : "";
}
function ColumnSelectFilter({ column, clauses, processing, onReplace, onSearch }) {
	const { filter, label } = column.props;
	if (!filter) return null;
	const multiple = filter.multiple;
	const operator = filter.defaultOperator;
	const clauseOptions = filter.clauseOptions ?? [];
	const activeClauseOption = findActiveClauseOption(clauses.map((entry) => entry.clause), clauseOptions);
	const active = clauses.find((entry) => entry.clause.operator === operator) ?? clauses[0];
	const value = activeClauseOption ? activeClauseOption.value : multiple ? active?.clause.value ? active.clause.value.split(",") : [] : active?.clause.value ?? "";
	const data = {
		key: column.key,
		type: "filter.select",
		props: {
			label,
			options: filter.options,
			multiple,
			searchable: filter.searchable,
			placeholder: null
		},
		schema: [{
			type: "field.select",
			key: column.key,
			props: {
				name: "value",
				label,
				options: filter.options,
				multiple,
				searchable: filter.searchable,
				placeholder: null
			}
		}]
	};
	function change(next) {
		const serialized = serializeColumnValue(filterValue(next).value);
		if (serialized === "") {
			onReplace(column.key, []);
			return;
		}
		const clauseOption = clauseOptions.find((option) => option.value === serialized);
		if (clauseOption) {
			onReplace(column.key, clausesForOption(column.key, clauseOption));
			return;
		}
		onReplace(column.key, [{
			field: column.key,
			operator,
			value: serialized
		}]);
	}
	return /* @__PURE__ */ jsx(TableFilterControl, {
		filter: data,
		value: { value },
		processing,
		bare: true,
		onChange: change,
		onSearch: onSearch ? (_field, query, signal) => onSearch(query, signal) : void 0
	});
}
function clausesForOption(field, option) {
	return option.clauses.map((clause) => ({
		field,
		operator: clause.operator,
		value: clause.value
	}));
}
function findActiveClauseOption(clauses, options) {
	return options.find((option) => clausesMatch(clauses, clausesForOption("", option)));
}
function clausesMatch(active, expected) {
	if (active.length !== expected.length) return false;
	return expected.every((clause) => active.some((current) => current.operator === clause.operator && current.value === clause.value));
}
function FilterClauseList({ column, clauses, operators, defaultOperator, processing, onAdd, onUpdate, onRemove }) {
	const { t } = useT("lattice");
	const type = column.props.filter?.type ?? "text";
	const [draftOperator, setDraftOperator] = useState(defaultOperator);
	const [adding, setAdding] = useState(clauses.length === 0);
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-3",
		children: [
			clauses.map((entry) => /* @__PURE__ */ jsx(FilterClauseRow, {
				column,
				type,
				operators,
				clause: entry.clause,
				processing,
				onOperator: (operator) => onUpdate(entry.index, {
					...entry.clause,
					operator
				}),
				onValue: (value) => value === "" ? onRemove(entry.index) : onUpdate(entry.index, {
					...entry.clause,
					value
				}),
				onRemove: () => onRemove(entry.index)
			}, entry.index)),
			adding && /* @__PURE__ */ jsx(FilterClauseRow, {
				column,
				type,
				operators,
				clause: {
					field: column.key,
					operator: draftOperator,
					value: ""
				},
				processing,
				onOperator: (operator) => {
					if (VALUELESS_FILTER_OPERATORS.has(operator)) {
						onAdd({
							field: column.key,
							operator,
							value: ""
						});
						setDraftOperator(defaultOperator);
						setAdding(false);
						return;
					}
					setDraftOperator(operator);
				},
				onValue: (value) => {
					if (value !== "") {
						onAdd({
							field: column.key,
							operator: draftOperator,
							value
						});
						setDraftOperator(defaultOperator);
						setAdding(false);
					}
				},
				onRemove: () => setAdding(false)
			}),
			/* @__PURE__ */ jsx("div", {
				className: "border-t border-lt-border pt-3",
				children: /* @__PURE__ */ jsx(Button, {
					variant: "secondary",
					icon: "plus",
					"data-test": `filter-${column.key}-add`,
					className: "w-full",
					disabled: processing,
					onClick: () => setAdding(true),
					children: t("table.filter.add", "Add filter")
				})
			})
		]
	});
}
function FilterClauseRow({ column, type, operators, clause, processing, onOperator, onValue, onRemove }) {
	const { t } = useT("lattice");
	const label = column.props.label ?? column.key;
	const valueless = VALUELESS_FILTER_OPERATORS.has(clause.operator);
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [operators.length > 1 ? /* @__PURE__ */ jsx(NativeSelect, {
				density: "compact",
				"aria-label": t("table.filter.operator", "{{label}} operator", { label }),
				"data-test": `filter-${column.key}-operator`,
				className: "flex-1",
				disabled: processing,
				value: clause.operator,
				onChange: (event) => onOperator(event.target.value),
				children: operators.map((operator) => /* @__PURE__ */ jsx("option", {
					value: operator,
					children: operatorLabel(operator)
				}, operator))
			}) : /* @__PURE__ */ jsx("span", {
				className: "flex-1 text-sm font-medium",
				children: operatorLabel(clause.operator)
			}), /* @__PURE__ */ jsx(Button, {
				emphasis: "outline",
				size: "icon",
				icon: "trash-2",
				"aria-label": t("table.filter.remove", "Remove {{label}} filter", { label }),
				"data-test": `filter-${column.key}-remove`,
				disabled: processing,
				onClick: onRemove
			})]
		}), !valueless && /* @__PURE__ */ jsx(FilterValueInput, {
			type,
			label,
			ariaLabel: t("table.filter.value", "{{label}} filter value", { label }),
			value: clause.value,
			processing,
			onCommit: onValue,
			onClear: () => onValue("")
		})]
	});
}
//#endregion
export { ColumnFilterControl };

//# sourceMappingURL=column-filter-control.js.map