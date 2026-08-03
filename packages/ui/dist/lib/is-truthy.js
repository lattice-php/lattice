//#region resources/js/lib/is-truthy.ts
/** Coerce a wire value (boolean, `1`/`0`, `"1"`/`"true"`) to a boolean. */
function isTruthy(value) {
	return value === true || value === 1 || value === "1" || value === "true";
}
//#endregion
export { isTruthy };

//# sourceMappingURL=is-truthy.js.map