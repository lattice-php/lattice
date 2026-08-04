import { walkFields } from "./field-props.js";
//#region resources/js/lib/collect-fields.ts
/** Gather the initial label and value of every named field in a schema. */
function collectFields(nodes) {
	const collected = {
		labels: {},
		values: {}
	};
	walkFields(nodes, (props) => {
		if (!props.name) return;
		if (props.label) collected.labels[props.name] = props.label;
		if (props.value !== void 0) collected.values[props.name] = props.value;
	});
	return collected;
}
//#endregion
export { collectFields };

//# sourceMappingURL=collect-fields.js.map