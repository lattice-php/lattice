import { AddRowMenu } from "./add-row-menu.js";
import { ROW_ID_KEY } from "./repeater-rows.js";
import { buildRowActions } from "./row-action-menu.js";
import { RowActions } from "./row-actions.js";
import { RowKeyInputs } from "./row-key-inputs.js";
import { RowItem } from "./row-item.js";
import { rowTemplatesOf } from "./row-templates.js";
import { TableRows, columnsFromSchema } from "./table-rows.js";
import { useFlipReorder } from "./use-flip-reorder.js";
import { useRowCollection } from "./use-row-collection.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useT } from "@lattice-php/ui/i18n";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
//#region resources/js/components/fields/builder.tsx
var EMPTY_TEMPLATE = [];
var BuilderComponent = ({ node }) => {
	const props = node.props;
	const name = props.name;
	const templates = rowTemplatesOf(node) ?? [];
	const { errors } = useFormContext();
	const { hidden, required } = useDependentField(node);
	const { path, rows, onField, onRemove, onMove, onDuplicate, append } = useRowCollection(name, props.defaultItems ?? 0);
	const { t } = useT("lattice");
	const orderSignature = rows.map((r) => String(r["rowId"] ?? "")).join(",");
	const registerRow = useFlipReorder(orderSignature);
	const atMax = props.maxItems != null && rows.length >= props.maxItems;
	const atMin = props.minItems != null && rows.length <= props.minItems;
	const isTable = props.layout === "table";
	const templateFor = (type) => templates.find((template) => template.type === type);
	const options = templates.map((template) => ({
		type: template.type,
		label: template.label
	}));
	if (hidden) return null;
	const primary = templates[0];
	const tableRows = rows.map((row, index) => {
		const template = templateFor(row.type);
		const isPrimary = !!template && !!primary && template.type === primary.type;
		return {
			key: String(row["rowId"] ?? index),
			index,
			row,
			template: template?.schema ?? EMPTY_TEMPLATE,
			span: !isPrimary,
			heading: template?.label ?? `Unknown block: ${String(row.type)}`
		};
	});
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
				/* @__PURE__ */ jsx(RowKeyInputs, {
					path,
					rows,
					rowKey: "type"
				}),
				isTable ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(TableRows, {
					base: path,
					columns: columnsFromSchema(primary?.schema ?? []),
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
				}) }) : rows.map((row, index) => {
					const template = templateFor(row.type);
					const key = String(row["rowId"] ?? index);
					return /* @__PURE__ */ jsx("div", {
						ref: (el) => registerRow(key, el),
						"data-flip-key": key,
						children: template ? /* @__PURE__ */ jsx(RowItem, {
							base: path,
							index,
							row,
							template: template.schema ?? EMPTY_TEMPLATE,
							heading: template.label,
							reorderable: props.reorderable ?? false,
							isFirst: index === 0,
							isLast: index === rows.length - 1,
							removable: !atMin,
							rowActions: props.rowActions,
							onField,
							onRemove,
							onMove,
							onDuplicate
						}) : /* @__PURE__ */ jsxs("div", {
							"data-test": `repeater-${name}-row-${index}`,
							className: "flex items-center justify-between rounded-lt border border-dashed border-lt-border p-4 text-sm text-lt-muted-fg",
							children: [/* @__PURE__ */ jsxs("span", { children: ["Unknown block: ", String(row.type)] }), /* @__PURE__ */ jsx(RowActions, { actions: buildRowActions(props.rowActions, {
								index,
								removable: !atMin,
								onRemove,
								onDuplicate,
								t
							}) })]
						})
					}, key);
				}),
				!atMax && /* @__PURE__ */ jsx(AddRowMenu, {
					addLabel: props.addLabel ?? "Add",
					options,
					onSelect: (type) => append({ type })
				})
			]
		})
	});
};
//#endregion
export { BuilderComponent };

//# sourceMappingURL=builder.js.map