import { lazyComponent } from "@lattice-php/core";
//#region resources/js/plugin.ts
var plugin_default = {
	name: "lattice/tree",
	components: { tree: lazyComponent(() => import("./tree.js")) },
	i18n: { namespace: "tree" }
};
//#endregion
export { plugin_default as default };

//# sourceMappingURL=plugin.js.map