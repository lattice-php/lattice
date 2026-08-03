//#region resources/js/test-id.ts
function testIdentity(value) {
	return value === void 0 || value === null || value === "" ? void 0 : value;
}
function nodeIdentity(node) {
	return testIdentity(node.key) ?? testIdentity(node.id);
}
function leafTestIdentity(value) {
	return testIdentity(value)?.split(".").at(-1);
}
function prefixedTestId(prefix, value) {
	const identity = leafTestIdentity(value);
	return identity ? `${prefix}-${identity}` : void 0;
}
function prefixedNodeTestId(prefix, node) {
	return prefixedTestId(prefix, nodeIdentity(node));
}
//#endregion
export { leafTestIdentity, nodeIdentity, prefixedNodeTestId, prefixedTestId, testIdentity };

//# sourceMappingURL=test-id.js.map