import { useCallback, useMemo, useRef } from "react";
import { filterValue, isActiveFilterValue } from "@lattice-php/table/lib/filter-values";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { Renderer } from "@lattice-php/core/renderer";
import { Checkbox } from "@lattice-php/ui/checkbox";
import { jsx, jsxs } from "react/jsx-runtime";
import { IconButton } from "@lattice-php/ui/icon-button";
import { FieldCommitOverrideProvider, FormProvider, FormValuesProvider, PrefillProvider, ResolvedNodesProvider, TableCellProvider, getPath, setPath, useFormValues, useSetFormValue } from "@lattice-php/form/embed";
import { isTruthy } from "@lattice-php/ui/lib/is-truthy";
//#region resources/js/components/filter-controls.tsx
function TableFilterControl({ filter, value, processing, bare = false, onChange, onSearch }) {
	const { t } = useT("lattice");
	const schema = filter.schema ?? [];
	if (schema.length === 0) return /* @__PURE__ */ jsx(ToggleControl, {
		filter,
		value,
		processing,
		onChange
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-end gap-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ jsx(SchemaControl, {
				filter,
				schema,
				value,
				processing,
				bare,
				onChange,
				onSearch
			})
		}), isActiveFilterValue(value) && /* @__PURE__ */ jsx(IconButton, {
			size: "md",
			icon: "x",
			label: t("table.filter.clear", "Clear {{label}} filter", { label: filter.props.label ?? "" }),
			disabled: processing,
			onClick: () => onChange(void 0)
		})]
	});
}
function SchemaControl({ filter, schema, value, processing, bare, onChange, onSearch }) {
	const initial = useMemo(() => filterValue(value), [value]);
	const form = useMemo(() => ({
		action: "#",
		clearErrors: () => {},
		componentId: `table-filter-${filter.key}`,
		componentRef: "",
		errors: {},
		fieldIdPrefix: `table-filter-${filter.key}`,
		fieldLabels: {},
		precognitive: false,
		processing,
		searchOptions: (field, query, _values, signal) => onSearch ? onSearch(field, query, signal) : Promise.resolve([]),
		touch: () => {},
		validate: () => {},
		validateFields: () => {},
		validating: false
	}), [
		filter.key,
		onSearch,
		processing
	]);
	const content = /* @__PURE__ */ jsx("div", {
		"aria-disabled": processing,
		className: cn("grid gap-3", processing && "pointer-events-none opacity-60"),
		children: /* @__PURE__ */ jsx(Renderer, { nodes: schema })
	});
	return /* @__PURE__ */ jsx(FormProvider, {
		value: form,
		children: /* @__PURE__ */ jsx(PrefillProvider, {
			value: { markUserEdit: () => {} },
			children: /* @__PURE__ */ jsx(ResolvedNodesProvider, {
				nodes: {},
				children: /* @__PURE__ */ jsx(FormValuesProvider, {
					initial,
					children: /* @__PURE__ */ jsx(TableFilterCommitBridge, {
						onChange,
						children: bare ? /* @__PURE__ */ jsx(TableCellProvider, { children: content }) : content
					})
				})
			})
		})
	});
}
function TableFilterCommitBridge({ children, onChange }) {
	const values = useFormValues();
	const setValue = useSetFormValue();
	const valuesRef = useRef(values);
	valuesRef.current = values;
	const write = useCallback((name, value) => {
		const nextValue = typeof value === "function" ? value(getPath(valuesRef.current, name)) : value;
		const next = setPath(valuesRef.current, name, nextValue);
		valuesRef.current = next;
		setValue(name, nextValue);
		onChange(next);
	}, [onChange, setValue]);
	const commit = useMemo(() => ({
		blur: () => {},
		change: write,
		commit: write
	}), [write]);
	return /* @__PURE__ */ jsx(FieldCommitOverrideProvider, {
		value: commit,
		children
	});
}
function ToggleControl({ filter, value, processing, onChange }) {
	const checked = isTruthy(filterValue(value).value);
	return /* @__PURE__ */ jsxs("label", {
		className: "flex h-lt-control-md cursor-pointer items-center gap-2 text-sm",
		children: [/* @__PURE__ */ jsx(Checkbox, {
			"aria-label": filter.props.label ?? void 0,
			"data-test": `table-filter-${filter.key}`,
			checked,
			disabled: processing,
			onCheckedChange: (next) => onChange(next === true ? { value: "1" } : void 0)
		}), /* @__PURE__ */ jsx("span", { children: filter.props.label })]
	});
}
//#endregion
export { TableFilterControl };

//# sourceMappingURL=filter-controls.js.map