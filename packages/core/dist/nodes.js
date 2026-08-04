//#region resources/js/nodes.ts
/**
* Keep only the well-formed component nodes from an untyped value, dropping
* anything that isn't an object carrying a string `type`.
*/
function toNodes(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((node) => typeof node === "object" && node !== null && "type" in node && typeof node.type === "string");
}
/**
* Stable list key for a node: the reconciliation key, then the id, then a
* type-scoped index fallback so keyless template children never collide.
*/
function nodeKey(node, index) {
	return node.key ?? node.id ?? `${node.type}-${index}`;
}
//#endregion
export { nodeKey, toNodes };

//# sourceMappingURL=nodes.js.map