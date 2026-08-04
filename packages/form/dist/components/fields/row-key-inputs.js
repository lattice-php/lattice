import "./repeater-rows.js";
import { Fragment, jsx } from "react/jsx-runtime";
import { appendPath, toHtmlName } from "@lattice-php/form/lib/form-path";
//#region resources/js/components/fields/row-key-inputs.tsx
/** Inertia serializes the live DOM on submit, so reserved row keys must be mounted as inputs. */
function RowKeyInputs({ path, rows, rowKey }) {
	return /* @__PURE__ */ jsx(Fragment, { children: rows.map((row, index) => /* @__PURE__ */ jsx("input", {
		type: "hidden",
		name: toHtmlName(appendPath(path, index, rowKey)),
		value: String(row[rowKey] ?? "")
	}, String(row["rowId"] ?? index))) });
}
//#endregion
export { RowKeyInputs };

//# sourceMappingURL=row-key-inputs.js.map