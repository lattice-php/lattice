//#region resources/js/lib/field-dom-name.ts
function fieldDomName(name, prefix) {
	if (!prefix) return name;
	const suffix = name.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
	return suffix ? `${prefix}-${suffix}` : prefix;
}
//#endregion
export { fieldDomName };

//# sourceMappingURL=field-dom-name.js.map