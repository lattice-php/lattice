import { ROW_FIELD_TYPES, fieldProps } from "./field-props.js";
import { errorKeyBelongsTo } from "./field-errors.js";
//#region resources/js/lib/wizard-steps.ts
function stepFieldNames(step) {
	const names = [];
	const collect = (node) => {
		const name = fieldProps(node).name;
		if (name) names.push(name);
		if (name && ROW_FIELD_TYPES.has(node.type)) return;
		for (const child of node.schema ?? []) collect(child);
	};
	for (const child of step.schema ?? []) collect(child);
	return names;
}
function stepValidationPaths(step) {
	const paths = [];
	const expand = (node) => {
		const name = fieldProps(node).name;
		if (name) paths.push(name, `${name}.*`);
		if (name && ROW_FIELD_TYPES.has(node.type)) {
			for (const child of stepFieldNames(node)) paths.push(`${name}.*.${child}`);
			return;
		}
		for (const child of node.schema ?? []) expand(child);
	};
	for (const child of step.schema ?? []) expand(child);
	return paths;
}
function stepsWithErrors(stepNames, errors) {
	const keys = Object.keys(errors).filter((key) => Boolean(errors[key]));
	const owners = /* @__PURE__ */ new Set();
	stepNames.forEach((names, index) => {
		if (keys.some((key) => names.some((name) => errorKeyBelongsTo(key, name)))) owners.add(index);
	});
	return owners;
}
function firstErroredStep(stepNames, errors) {
	const owners = stepsWithErrors(stepNames, errors);
	return owners.size > 0 ? Math.min(...owners) : null;
}
//#endregion
export { firstErroredStep, stepFieldNames, stepValidationPaths, stepsWithErrors };

//# sourceMappingURL=wizard-steps.js.map