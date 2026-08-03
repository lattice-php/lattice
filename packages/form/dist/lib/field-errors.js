//#region resources/js/lib/field-errors.ts
/** Whether an error-bag key targets the named field itself or a path nested under it. */
function errorKeyBelongsTo(key, name) {
	return key === name || key.startsWith(`${name}.`);
}
/** Reduce a Laravel 422 error bag (arrays of messages) to the first per field. */
function firstErrors(errors) {
	const result = {};
	for (const [key, value] of Object.entries(errors ?? {})) result[key] = Array.isArray(value) ? value[0] : value;
	return result;
}
//#endregion
export { errorKeyBelongsTo, firstErrors };

//# sourceMappingURL=field-errors.js.map