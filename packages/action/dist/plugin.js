import ActionComponent from "./components/action.js";
import ActionGroupComponent from "./components/action-group.js";
import { eagerComponent } from "@lattice-php/core/registry";
//#region resources/js/plugin.ts
var actionComponents = {
	components: {
		action: eagerComponent(ActionComponent),
		"action.group": eagerComponent(ActionGroupComponent)
	},
	name: "lattice/action"
};
//#endregion
export { actionComponents, actionComponents as default };

//# sourceMappingURL=plugin.js.map