import TableComponent from "./components/table.js";
import { eagerComponent } from "@lattice-php/core/registry";
//#region resources/js/plugin.ts
var tableComponents = {
	components: { table: eagerComponent(TableComponent) },
	name: "lattice/table"
};
//#endregion
export { tableComponents as default, tableComponents };

//# sourceMappingURL=plugin.js.map