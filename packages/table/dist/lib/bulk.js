import { translate } from "@lattice-php/ui/i18n";
//#region resources/js/lib/bulk.ts
function getBulkActions(actions) {
	return (actions ?? []).flatMap((node) => {
		if (node.type !== "action" && node.type !== "action.bulk") return [];
		const action = node;
		const props = action.props;
		if (!props.endpoint) return [];
		return [{
			id: action.id ?? "",
			label: props.label ?? translate("lattice", "common.action.run", "Run action"),
			method: props.method ?? "post",
			endpoint: props.endpoint,
			ref: props.ref ?? "",
			variant: props.variant,
			emphasis: props.emphasis,
			confirmation: props.confirmation,
			form: props.form,
			modalSide: props.modalSide,
			modalWidth: props.modalWidth
		}];
	});
}
//#endregion
export { getBulkActions };

//# sourceMappingURL=bulk.js.map