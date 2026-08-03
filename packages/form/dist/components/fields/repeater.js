import { ROW_ID_KEY } from "./repeater-rows.js";
import { RowKeyInputs } from "./row-key-inputs.js";
import { RowItem } from "./row-item.js";
import { TableRows, columnsFromSchema } from "./table-rows.js";
import { useFlipReorder } from "./use-flip-reorder.js";
import { useRowCollection } from "./use-row-collection.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
import { Icon } from "@lattice-php/ui/icons";
//#region resources/js/components/fields/repeater.tsx
var EMPTY_TEMPLATE = [];
var RepeaterComponent = ({ node }) => {
	const props = node.props;
	const name = props.name;
	const { errors } = useFormContext();
	const { hidden, required } = useDependentField(node);
	const { path, rows, onField, onRemove, onMove, onDuplicate, append } = useRowCollection(name, props.defaultItems ?? 1);
	const template = node.schema ?? EMPTY_TEMPLATE;
	const orderSignature = rows.map((r) => String(r["rowId"] ?? "")).join(",");
	const registerRow = useFlipReorder(orderSignature);
	const atMax = props.maxItems != null && rows.length >= props.maxItems;
	const atMin = props.minItems != null && rows.length <= props.minItems;
	const isTable = props.layout === "table";
	const itemLabels = props.itemLabels;
	const rowHeading = (index) => {
		const label = itemLabels?.[index];
		if (typeof label === "string" && label !== "") return label;
		return props.itemLabel ? `${props.itemLabel} ${index + 1}` : `#${index + 1}`;
	};
	if (hidden) return null;
	const tableRows = rows.map((row, index) => ({
		key: String(row["rowId"] ?? index),
		index,
		row,
		template,
		span: false,
		heading: rowHeading(index)
	}));
	return /* @__PURE__ */ jsx(FormFieldFrame, {
		error: errors[path],
		helperText: props.helperText ?? void 0,
		tooltip: props.tooltip ?? void 0,
		label: props.label ?? "",
		id: path,
		required,
		children: (controlProps) => /* @__PURE__ */ jsxs("div", {
			...controlProps,
			className: "flex flex-col gap-3",
			role: "group",
			children: [
				/* @__PURE__ */ jsx(RowKeyInputs, {
					path,
					rows,
					rowKey: ROW_ID_KEY
				}),
				isTable ? /* @__PURE__ */ jsx(TableRows, {
					base: path,
					columns: columnsFromSchema(template),
					rows: tableRows,
					reorderable: props.reorderable ?? false,
					removable: () => !atMin,
					rowActions: props.rowActions,
					onField,
					onMove,
					onRemove,
					onDuplicate,
					registerRow,
					resizableColumns: props.resizableColumns === true,
					resizeIndicator: props.resizeIndicator === true
				}) : rows.map((row, index) => {
					const key = String(row["rowId"] ?? index);
					return /* @__PURE__ */ jsx("div", {
						ref: (el) => registerRow(key, el),
						"data-flip-key": key,
						children: /* @__PURE__ */ jsx(RowItem, {
							base: path,
							index,
							row,
							template,
							heading: rowHeading(index),
							reorderable: props.reorderable ?? false,
							isFirst: index === 0,
							isLast: index === rows.length - 1,
							removable: !atMin,
							rowActions: props.rowActions,
							onField,
							onRemove,
							onMove,
							onDuplicate
						})
					}, key);
				}),
				!atMax && /* @__PURE__ */ jsxs("button", {
					type: "button",
					"data-test": `repeater-${name}-add`,
					className: "inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm",
					onClick: () => append({}),
					children: [/* @__PURE__ */ jsx(Icon, { name: "plus" }), props.addLabel ?? "Add"]
				})
			]
		})
	});
};
//#endregion
export { RepeaterComponent };

//# sourceMappingURL=repeater.js.map