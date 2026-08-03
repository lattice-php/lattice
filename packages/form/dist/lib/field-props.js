//#region resources/js/lib/field-props.ts
/**
* Field types whose value is a collection of rows. Schema walkers must not
* descend into their child schemas as top-level fields; children live under
* `name.<index>.` paths instead.
*/
var ROW_FIELD_TYPES = /* @__PURE__ */ new Set(["field.builder", "field.repeater"]);
function fieldProps(node) {
	return node.props;
}
function walkFields(nodes, visit) {
	for (const child of nodes ?? []) {
		visit(fieldProps(child), child);
		walkFields(child.schema, visit);
	}
}
//#endregion
export { ROW_FIELD_TYPES, fieldProps, walkFields };

//# sourceMappingURL=field-props.js.map