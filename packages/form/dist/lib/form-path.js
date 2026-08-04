//#region resources/js/lib/form-path.ts
function pathParts(path) {
	return path.split(".").filter((part) => part !== "");
}
function appendPath(base, ...parts) {
	const suffix = parts.map(String).filter((part) => part !== "");
	return [base ?? "", ...suffix].filter((part) => part !== "").join(".");
}
function toHtmlName(path) {
	const [head, ...tail] = pathParts(path);
	return tail.reduce((name, part) => `${name}[${part}]`, head ?? "");
}
function getPath(values, path) {
	let current = values;
	for (const part of pathParts(path)) {
		if (current == null) return;
		current = current[part];
	}
	return current;
}
function emptyContainer(nextPart) {
	return nextPart !== void 0 && /^\d+$/.test(nextPart) ? [] : {};
}
function setPath(values, path, value) {
	const parts = pathParts(path);
	if (parts.length === 0) return values;
	const write = (current, index) => {
		const part = parts[index];
		const last = index === parts.length - 1;
		const source = current && typeof current === "object" ? current : emptyContainer(parts[index + 1]);
		const next = Array.isArray(source) ? [...source] : { ...source };
		next[part] = last ? value : write(source[part], index + 1);
		return next;
	};
	return write(values, 0);
}
//#endregion
export { appendPath, getPath, setPath, toHtmlName };

//# sourceMappingURL=form-path.js.map