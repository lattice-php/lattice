import { BadgeCell } from "./cells/badge-cell.js";
import { BooleanCell } from "./cells/boolean-cell.js";
import { IconCell } from "./cells/icon-cell.js";
import { ImageCell } from "./cells/image-cell.js";
import { MoneyCell } from "./cells/money-cell.js";
import { NumberCell } from "./cells/number-cell.js";
import { StackCell } from "./cells/stack-cell.js";
import { TextCell } from "./cells/text-cell.js";
import { jsx } from "react/jsx-runtime";
import { columnCell, useColumnRegistry } from "@lattice-php/table/registry";
//#region resources/js/components/table-cell.tsx
var builtinColumnCells = {
	"column.badge": columnCell(BadgeCell),
	"column.boolean": columnCell(BooleanCell),
	"column.icon": columnCell(IconCell),
	"column.image": columnCell(ImageCell),
	"column.money": columnCell(MoneyCell),
	"column.number": columnCell(NumberCell),
	"column.stack": columnCell(StackCell),
	"column.text": columnCell(TextCell)
};
function ColumnCell({ column, row }) {
	const Cell = useColumnRegistry()[column.type] ?? builtinColumnCells[column.type] ?? builtinColumnCells["column.text"];
	return /* @__PURE__ */ jsx(Cell, {
		column,
		props: column.props,
		row,
		value: row[column.key]
	});
}
//#endregion
export { ColumnCell };

//# sourceMappingURL=table-cell.js.map