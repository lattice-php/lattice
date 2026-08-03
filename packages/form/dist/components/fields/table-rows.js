import { buildRowActions } from "./row-action-menu.js";
import { RowActions } from "./row-actions.js";
import { RowButton, RowItem } from "./row-item.js";
import { memo, useMemo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useT } from "@lattice-php/ui/i18n";
import { Icon } from "@lattice-php/ui/icons";
import { nodeKey } from "@lattice-php/core/nodes";
import { RenderNode } from "@lattice-php/core/renderer";
import { FieldScopeProvider } from "@lattice-php/form/hooks/field-scope";
import { DEFAULT_COLUMN_WIDTH } from "@lattice-php/core/hooks/column-sizing";
import { useColumnResizing } from "@lattice-php/core/hooks/use-column-resizing";
import { useMediaQuery } from "@lattice-php/ui/lib/use-media-query";
import { TableCellProvider } from "@lattice-php/form/hooks/row-layout-context";
//#region resources/js/components/fields/table-rows.tsx
var rowControlTrack = "3rem";
var rowActionTrack = "3rem";
var rowControlTracks = [rowControlTrack];
var rowActionTracks = [rowActionTrack];
var tableViewportQuery = "(min-width: 768px)";
function useTableViewport() {
	return useMediaQuery(tableViewportQuery, true);
}
function columnsFromSchema(nodes) {
	return nodes.map((node) => {
		const props = node.props;
		return {
			name: String(props.name),
			label: String(props.label ?? props.name),
			columnWidth: props.columnWidth ?? DEFAULT_COLUMN_WIDTH
		};
	});
}
var TableRowItem = memo(function TableRowItem({ base, index, row, template, span, isFirst, isLast, columnCount, flipKey, reorderable, removable, rowActions, onField, onMove, onRemove, onDuplicate, registerRow }) {
	const { t } = useT("lattice");
	return /* @__PURE__ */ jsxs("div", {
		ref: (el) => registerRow?.(flipKey, el),
		"data-flip-key": flipKey,
		"data-test": `table-row-${base}-${index}`,
		className: "grid grid-cols-[var(--lattice-table-columns)] items-start gap-x-3",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1 [&_svg]:size-lt-icon-sm",
				children: [reorderable && !isFirst && /* @__PURE__ */ jsx(RowButton, {
					label: "Move up",
					testId: `table-${base}-up-${index}`,
					onClick: () => onMove(index, -1),
					children: /* @__PURE__ */ jsx(Icon, { name: "arrow-up" })
				}), reorderable && !isLast && /* @__PURE__ */ jsx(RowButton, {
					label: "Move down",
					testId: `table-${base}-down-${index}`,
					onClick: () => onMove(index, 1),
					children: /* @__PURE__ */ jsx(Icon, { name: "arrow-down" })
				})]
			}),
			/* @__PURE__ */ jsx(FieldScopeProvider, {
				base,
				index,
				row,
				onChange: (field, value) => onField(index, field, value),
				children: /* @__PURE__ */ jsx(TableCellProvider, { children: span ? /* @__PURE__ */ jsx("div", {
					"data-test": `table-row-${base}-${index}-span`,
					className: "flex flex-col gap-2",
					style: { gridColumn: `span ${columnCount}` },
					children: template.map((child, childIndex) => /* @__PURE__ */ jsx(RenderNode, { node: child }, nodeKey(child, childIndex)))
				}) : template.map((child, childIndex) => /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(RenderNode, { node: child }) }, nodeKey(child, childIndex))) })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center",
				children: /* @__PURE__ */ jsx(RowActions, { actions: buildRowActions(rowActions, {
					index,
					removable,
					onRemove,
					onDuplicate,
					t
				}) })
			})
		]
	});
});
function TableRows({ base, columns, rows, reorderable, removable, rowActions, onField, onMove, onRemove, onDuplicate, registerRow, resizableColumns = false, resizeIndicator = false }) {
	const { t } = useT("lattice");
	const isTableViewport = useTableViewport();
	const sizingColumns = useMemo(() => columns.map((column) => ({
		key: column.name,
		label: column.label,
		width: column.columnWidth
	})), [columns]);
	const { getResizeHandleProps, gridTemplateColumns, hasOverrides, resizeRootRef, resetColumns } = useColumnResizing({
		columns: sizingColumns,
		enabled: resizableColumns,
		columnGapPx: 12,
		leadingTracks: rowControlTracks,
		showIndicator: resizeIndicator,
		storageKey: resizableColumns ? `lattice:table-columns:form:${base}` : void 0,
		trailingTracks: rowActionTracks
	});
	if (!isTableViewport) return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-3",
		children: rows.map((row) => /* @__PURE__ */ jsx("div", {
			ref: (el) => registerRow?.(row.key, el),
			"data-flip-key": row.key,
			children: /* @__PURE__ */ jsx(RowItem, {
				base,
				index: row.index,
				row: row.row,
				template: row.template,
				heading: row.heading ?? `#${row.index + 1}`,
				reorderable,
				isFirst: row.index === 0,
				isLast: row.index === rows.length - 1,
				removable: removable(row.index),
				rowActions,
				onField,
				onRemove,
				onMove,
				onDuplicate
			})
		}, row.key))
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [hasOverrides && /* @__PURE__ */ jsx("button", {
			"aria-label": t("table.reset-column-widths", "Reset column widths"),
			className: "absolute right-1 top-1 z-10 hidden rounded-lt-sm p-1 text-lt-muted-fg hover:text-lt-fg md:inline-flex",
			"data-test": "table-reset-columns",
			onClick: resetColumns,
			title: t("table.reset-column-widths", "Reset column widths"),
			type: "button",
			children: /* @__PURE__ */ jsx(Icon, {
				name: "rotate-ccw",
				className: "size-lt-icon-sm"
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ jsxs("div", {
				ref: resizeRootRef,
				className: "flex min-w-max flex-col gap-2",
				style: { "--lattice-table-columns": gridTemplateColumns },
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-[var(--lattice-table-columns)] items-center gap-x-3",
					children: [
						/* @__PURE__ */ jsx("div", {}),
						columns.map((column, index) => /* @__PURE__ */ jsxs("div", {
							className: "relative min-w-0 pr-3 text-xs font-medium text-lt-muted-fg",
							children: [column.label, resizableColumns && /* @__PURE__ */ jsx("div", { ...getResizeHandleProps(sizingColumns[index]) })]
						}, column.name)),
						/* @__PURE__ */ jsx("div", {})
					]
				}), rows.map((row) => /* @__PURE__ */ jsx(TableRowItem, {
					base,
					index: row.index,
					row: row.row,
					template: row.template,
					span: row.span,
					isFirst: row.index === 0,
					isLast: row.index === rows.length - 1,
					columnCount: columns.length,
					flipKey: row.key,
					reorderable,
					removable: removable(row.index),
					rowActions,
					onField,
					onMove,
					onRemove,
					onDuplicate,
					registerRow
				}, row.key))]
			})
		})]
	});
}
//#endregion
export { TableRows, columnsFromSchema };

//# sourceMappingURL=table-rows.js.map