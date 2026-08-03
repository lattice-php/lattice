import { ROW_FIELD_TYPES, fieldProps } from "./field-props.js";
import { appendPath, getPath } from "./form-path.js";
import { buildOverrideKey, rowIdFrom } from "./override-keys.js";
import { rowSchemaFor } from "@lattice-php/form/components/fields/row-templates";
//#region resources/js/lib/prefill-targets.ts
function mapDep(dep, rowPath) {
	if (dep.startsWith("@")) return dep.slice(1);
	return rowPath === null ? dep : appendPath(rowPath, dep);
}
function targetFor(node, rowPath, identityCollectionPath, index = 0, row = {}) {
	const props = fieldProps(node);
	if (!props.editablePrefill || !props.name) return null;
	const rowId = rowIdFrom(row);
	return {
		path: rowPath === null ? props.name : appendPath(rowPath, props.name),
		overrideKey: identityCollectionPath === null ? props.name : buildOverrideKey(identityCollectionPath, rowId, index, props.name),
		resetOn: (props.prefillResetOn ?? []).map((dep) => mapDep(dep, rowPath)),
		refreshOn: (props.prefillRefreshOn ?? []).map((dep) => mapDep(dep, rowPath))
	};
}
function collectPrefillTargets(nodes, values) {
	const targets = [];
	const walk = (list, rowPath = null, identityRowPath = null, identityCollectionPath = null, index = 0, row = {}) => {
		for (const node of list ?? []) {
			if (ROW_FIELD_TYPES.has(node.type)) {
				const name = fieldProps(node).name;
				if (name) {
					const childCollectionPath = appendPath(rowPath, name);
					const childIdentityCollectionPath = appendPath(identityRowPath, name);
					const storedRows = getPath(values, childCollectionPath);
					(Array.isArray(storedRows) ? storedRows : []).forEach((childRow, childIndex) => {
						walk(rowSchemaFor(node, childRow), appendPath(childCollectionPath, childIndex), appendPath(childIdentityCollectionPath, rowIdFrom(childRow) ?? childIndex), childIdentityCollectionPath, childIndex, childRow);
					});
				}
				continue;
			}
			const target = targetFor(node, rowPath, identityCollectionPath, index, row);
			if (target) targets.push(target);
			walk(node.schema, rowPath, identityRowPath, identityCollectionPath, index, row);
		}
	};
	walk(nodes);
	return targets;
}
function pathsToClear(previous, next) {
	const previousByKey = new Map(previous.targets.map((target) => [target.overrideKey, target]));
	return next.targets.filter((target) => {
		const previousTarget = previousByKey.get(target.overrideKey);
		return target.resetOn.some((dep, index) => {
			const previousDep = previousTarget?.resetOn[index] ?? dep;
			return !Object.is(getPath(previous.values, previousDep), getPath(next.values, dep));
		});
	}).map((target) => target.overrideKey);
}
function seededOverrides(targets, values) {
	return targets.filter((target) => {
		const value = getPath(values, target.path);
		return value !== void 0 && value !== null && value !== "";
	}).map((target) => target.overrideKey);
}
function pruneOverrides(overrides, targets) {
	const liveKeys = new Set(targets.map((target) => target.overrideKey));
	return new Set([...overrides].filter((key) => liveKeys.has(key)));
}
//#endregion
export { collectPrefillTargets, getPath, pathsToClear, pruneOverrides, seededOverrides };

//# sourceMappingURL=prefill-targets.js.map