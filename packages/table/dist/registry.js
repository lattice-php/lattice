import { useExtensionRegistry } from "@lattice-php/core/registry-context";
//#region resources/js/registry.ts
var COLUMN_REGISTRY_EXTENSION = "table.columns";
function useColumnRegistry() {
	return useExtensionRegistry(COLUMN_REGISTRY_EXTENSION);
}
/**
* Registers a typed column cell, erasing the type parameter so it fits the
* registry. Mirrors `eagerComponent`/`lazyComponent` for the component registry:
* author against `ColumnCellComponent<"my.type">` for typed `props`, register
* through this.
*/
function columnCell(cell) {
	return cell;
}
//#endregion
export { COLUMN_REGISTRY_EXTENSION, columnCell, useColumnRegistry };

//# sourceMappingURL=registry.js.map