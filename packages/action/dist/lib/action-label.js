import { translate } from "@lattice-php/ui/i18n";
//#region resources/js/lib/action-label.ts
function actionLabel(node) {
	return node.props.label ?? translate("lattice", "common.action.run", "Run action");
}
//#endregion
export { actionLabel };

//# sourceMappingURL=action-label.js.map