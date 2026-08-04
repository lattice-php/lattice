//#region resources/js/i18n/translatable.ts
function isTranslatable(value) {
	return typeof value === "object" && value !== null && typeof value.key === "string";
}
function readPath(payload, path) {
	return path.split(".").reduce((node, segment) => {
		if (typeof node === "object" && node !== null) return node[segment];
	}, payload);
}
function resolveText(value, t) {
	return isTranslatable(value) ? resolveTranslatable(value, {}, t) : value;
}
function resolveTranslatable(value, payload, t) {
	const fromPayload = {};
	for (const [name, path] of Object.entries(value.payload)) {
		const read = readPath(payload, path);
		fromPayload[name] = read === void 0 ? "" : read;
	}
	return t(value.key, value.key, {
		...value.replacements,
		...fromPayload
	});
}
//#endregion
export { isTranslatable, resolveText, resolveTranslatable };

//# sourceMappingURL=translatable.js.map