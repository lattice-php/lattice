//#region resources/js/components/fields/row-templates.ts
function rowTemplatesOf(node) {
	return node.templates;
}
/** The schema for a submitted row: its matching template, or the node's own schema when untyped. */
function rowSchemaFor(node, row) {
	const templates = rowTemplatesOf(node);
	if (!templates) return node.schema ?? [];
	return templates.find((template) => template.type === row.type)?.schema ?? [];
}
//#endregion
export { rowSchemaFor, rowTemplatesOf };

//# sourceMappingURL=row-templates.js.map