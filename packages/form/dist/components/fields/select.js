import { useCallback, useMemo, useRef, useState } from "react";
import { Renderer } from "@lattice-php/core/renderer";
import { useT } from "@lattice-php/ui/i18n";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { postFormAction } from "@lattice-php/form/lib/form-transport";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
import { Icon } from "@lattice-php/ui/icons";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useFormValue, useFormValues } from "@lattice-php/form/hooks/values";
import { fieldDomName } from "@lattice-php/form/lib/field-dom-name";
import { useFieldCommit } from "@lattice-php/form/hooks/use-field-commit";
import { useResolvedNode } from "@lattice-php/form/hooks/resolved-nodes";
import { cn } from "@lattice-php/ui/lib/utils";
import { controlSurface } from "@lattice-php/ui/control";
import { Combobox } from "@lattice-php/ui/combobox";
import { coerceColor, colorValue } from "@lattice-php/ui/lib/color";
import { materializeSchema } from "@lattice-php/core/materialize";
//#region resources/js/components/fields/select.tsx
function toValues(stored, fallback) {
	const source = stored ?? fallback;
	if (Array.isArray(source)) return source.map(String);
	if (source === void 0 || source === null || source === "") return [];
	return [String(source)];
}
var SelectComponent = ({ node }) => {
	const { t } = useT("lattice");
	const props = node.props;
	const { action, componentRef, errors, fieldIdPrefix, searchOptions } = useFormContext();
	const { hidden, required, readOnly, disabled } = useDependentField(node);
	const { change, blur } = useFieldCommit();
	const resolvedNode = useResolvedNode(node);
	const name = props.name;
	const scope = useFieldScope();
	const domName = fieldDomName(scope ? scope.scopedName(name) : name, fieldIdPrefix);
	const errorKey = scope ? scope.errorKey(name) : name;
	const searchKey = errorKey;
	const placeholder = props.placeholder || "Select…";
	const multiple = props.multiple;
	const searchable = props.searchable;
	const creatable = props.creatable;
	const staticOptions = useMemo(() => resolvedNode.props.options ?? [], [resolvedNode.props]);
	const optionSchema = resolvedNode.props.optionSchema;
	const globalValue = useFormValue(name);
	const values = useFormValues();
	const valuesRef = useRef(values);
	valuesRef.current = values;
	const storedValue = scope ? scope.getValue(name) : globalValue;
	const selected = useMemo(() => toValues(storedValue, props.value), [storedValue, props.value]);
	const selectedRef = useRef(selected);
	selectedRef.current = selected;
	const [open, setOpen] = useState(false);
	const [results, setResults] = useState(null);
	const [loading, setLoading] = useState(false);
	const searchAbort = useRef(null);
	const optionsByValue = useMemo(() => {
		const map = /* @__PURE__ */ new Map();
		for (const option of [...staticOptions, ...results ?? []]) map.set(option.value, option);
		return map;
	}, [staticOptions, results]);
	const labelFor = (value) => optionsByValue.get(value)?.label ?? value;
	const colorFor = (value) => coerceColor((optionsByValue.get(value)?.data)?.color);
	const locked = readOnly || disabled;
	const search = useCallback((query) => {
		searchAbort.current?.abort();
		if (query.trim() === "") {
			setResults(null);
			setLoading(false);
			return;
		}
		const controller = new AbortController();
		searchAbort.current = controller;
		setLoading(true);
		if (searchOptions) {
			searchOptions(searchKey, query, valuesRef.current, controller.signal).then((options) => {
				setResults(options);
				setLoading(false);
			}).catch(() => {});
			return;
		}
		postFormAction(action, componentRef, {
			...valuesRef.current,
			_sub: "search",
			_target: searchKey,
			_q: query
		}, controller.signal).then((response) => {
			setResults(response?.options ?? []);
			setLoading(false);
		}).catch(() => {});
	}, [
		action,
		componentRef,
		searchKey,
		searchOptions
	]);
	function commit(next) {
		change(name, multiple ? next : next[0] ?? "");
	}
	function select(value) {
		if (multiple) {
			const next = selectedRef.current.includes(value) ? selectedRef.current.filter((item) => item !== value) : [...selectedRef.current, value];
			selectedRef.current = next;
			commit(next);
			return;
		}
		selectedRef.current = [value];
		commit([value]);
	}
	function remove(value) {
		commit(selected.filter((item) => item !== value));
	}
	function applyCreated(value) {
		if (!multiple) {
			selectedRef.current = [value];
			commit([value]);
			return;
		}
		if (!selectedRef.current.includes(value)) {
			const next = [...selectedRef.current, value];
			selectedRef.current = next;
			commit(next);
		}
	}
	if (hidden) return null;
	const options = searchable ? results ?? staticOptions : staticOptions;
	const renderOption = optionSchema?.length ? (option) => /* @__PURE__ */ jsx(Renderer, { nodes: materializeSchema(optionSchema, {
		...option.data,
		label: option.label,
		value: option.value
	}) }) : void 0;
	return /* @__PURE__ */ jsx(FormFieldFrame, {
		error: errors[errorKey],
		helperText: props.helperText ?? void 0,
		tooltip: props.tooltip ?? void 0,
		label: props.label ?? "",
		id: domName,
		required,
		children: (controlProps) => /* @__PURE__ */ jsxs(Fragment, { children: [multiple ? selected.map((value) => /* @__PURE__ */ jsx("input", {
			name: `${domName}[]`,
			type: "hidden",
			value
		}, value)) : /* @__PURE__ */ jsx("input", {
			name: domName,
			type: "hidden",
			value: selected[0] ?? ""
		}), /* @__PURE__ */ jsxs("div", { children: [multiple && selected.length > 0 && /* @__PURE__ */ jsx("div", {
			className: "mb-1.5 flex flex-wrap gap-1",
			children: selected.map((value) => {
				const color = colorFor(value);
				return /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 text-xs",
					children: [
						color && /* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							className: "size-2 shrink-0 rounded-full",
							style: { background: colorValue(color) }
						}),
						labelFor(value),
						!locked && /* @__PURE__ */ jsx("button", {
							"aria-label": t("form.remove-option", "Remove {{label}}", { label: labelFor(value) }),
							"data-test": `select-${name}-remove-${value}`,
							className: "text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-xs",
							onClick: () => remove(value),
							type: "button",
							children: /* @__PURE__ */ jsx(Icon, { name: "x" })
						})
					]
				}, value);
			})
		}), /* @__PURE__ */ jsx(Combobox, {
			creatable,
			emptyLabel: props.emptyLabel ?? void 0,
			loading,
			multiple,
			onCommit: applyCreated,
			onCreate: applyCreated,
			onSearch: searchable ? search : void 0,
			onSelect: select,
			open: open && !locked,
			onOpenChange: (next) => {
				setOpen(next);
				if (!next) blur(name);
			},
			options,
			renderOption,
			searchPlaceholder: props.searchPlaceholder ?? void 0,
			showSearch: Boolean(searchable || creatable),
			selected,
			testId: `select-${name}`,
			trigger: /* @__PURE__ */ jsxs(Fragment, { children: [!multiple && selected.length > 0 ? /* @__PURE__ */ jsx("span", { children: labelFor(selected[0]) }) : /* @__PURE__ */ jsx("span", {
				className: "text-lt-muted-fg",
				children: placeholder
			}), /* @__PURE__ */ jsx(Icon, {
				name: "chevrons-up-down",
				className: "size-lt-icon-md shrink-0 text-lt-muted-fg"
			})] }),
			triggerClassName: cn(controlSurface(), "flex items-center justify-between gap-2 text-left", locked && "cursor-not-allowed opacity-60"),
			triggerProps: {
				...controlProps,
				"aria-haspopup": "listbox",
				autoFocus: props.autoFocus ?? void 0,
				"data-test": `select-${name}`,
				disabled: locked,
				tabIndex: props.tabIndex ?? void 0
			}
		})] })] })
	});
};
//#endregion
export { SelectComponent };

//# sourceMappingURL=select.js.map