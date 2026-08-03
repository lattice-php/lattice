//#region resources/js/lib/conditions.ts
function conditionFields(conditions) {
	const fields = /* @__PURE__ */ new Set();
	for (const group of [
		conditions?.visible,
		conditions?.required,
		conditions?.readOnly,
		conditions?.disabled
	]) for (const condition of group ?? []) fields.add(condition.field);
	return Array.from(fields);
}
var BOOLEAN_TRUE_VALUES = /* @__PURE__ */ new Set([
	"1",
	"true",
	"on",
	"yes"
]);
function toBoolean(value) {
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value === 1;
	return BOOLEAN_TRUE_VALUES.has(String(value).toLowerCase());
}
function equals(actual, expected) {
	if (typeof expected === "boolean") return toBoolean(actual) === expected;
	return String(actual ?? "") === String(expected ?? "");
}
function isIn(actual, expected) {
	return (Array.isArray(expected) ? expected : [expected]).map((value) => String(value)).includes(String(actual ?? ""));
}
function isBlank(value) {
	return value == null || String(value).trim() === "";
}
function compareDates(actual, expected) {
	const left = Date.parse(String(actual));
	const right = Date.parse(String(expected));
	if (Number.isNaN(left) || Number.isNaN(right)) return null;
	return left === right ? 0 : left < right ? -1 : 1;
}
function evaluateUnknownOperator(_operator) {
	return true;
}
function evaluateOp(operator, actual, expected) {
	switch (operator) {
		case "eq": return equals(actual, expected);
		case "neq": return !equals(actual, expected);
		case "gt": return Number(actual) > Number(expected);
		case "lt": return Number(actual) < Number(expected);
		case "gte": return Number(actual) >= Number(expected);
		case "lte": return Number(actual) <= Number(expected);
		case "contains": return String(actual ?? "").includes(String(expected ?? ""));
		case "starts_with": return String(actual ?? "").startsWith(String(expected ?? ""));
		case "ends_with": return String(actual ?? "").endsWith(String(expected ?? ""));
		case "in": return isIn(actual, expected);
		case "not_in": return !isIn(actual, expected);
		case "before": return compareDates(actual, expected) === -1;
		case "after": return compareDates(actual, expected) === 1;
		case "empty": return isBlank(actual);
		case "filled": return !isBlank(actual);
		default: return evaluateUnknownOperator(operator);
	}
}
function allMatch(conditions, values) {
	return conditions.every((condition) => evaluateOp(condition.operator, values[condition.field], condition.value));
}
function anyMatch(conditions, values) {
	return Boolean(conditions?.some((condition) => evaluateOp(condition.operator, values[condition.field], condition.value)));
}
function evaluateConditions(conditions, values, flags) {
	const visible = !conditions?.visible?.length || allMatch(conditions.visible, values);
	return {
		hidden: Boolean(flags.hidden) || !visible,
		required: Boolean(flags.required) || anyMatch(conditions?.required, values),
		readOnly: Boolean(flags.readOnly) || anyMatch(conditions?.readOnly, values),
		disabled: Boolean(flags.disabled) || anyMatch(conditions?.disabled, values)
	};
}
//#endregion
export { conditionFields, evaluateConditions, toBoolean };

//# sourceMappingURL=conditions.js.map