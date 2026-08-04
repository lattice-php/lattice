import { createContext, useContext } from "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/hooks/row-layout-context.tsx
var TableCellContext = createContext(false);
function TableCellProvider({ children }) {
	return /* @__PURE__ */ jsx(TableCellContext.Provider, {
		value: true,
		children
	});
}
/** True when a field is being rendered inside a table-layout cell (no own label). */
function useInTableCell() {
	return useContext(TableCellContext);
}
//#endregion
export { TableCellProvider, useInTableCell };

//# sourceMappingURL=row-layout-context.js.map