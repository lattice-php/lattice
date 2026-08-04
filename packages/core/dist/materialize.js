//#region resources/js/materialize.ts
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function dataBindings(value) {
	if (!isRecord(value)) return {};
	return Object.fromEntries(Object.entries(value).filter((entry) => {
		return typeof entry[1] === "string";
	}));
}
function rowValue(row, key) {
	if (key in row) return row[key];
	return key.split(".").reduce((value, segment) => {
		return isRecord(value) ? value[segment] : void 0;
	}, row);
}
function materializeProps(props, row) {
	if (!isRecord(props)) return {};
	const { dataBindings: bindings, ...materialized } = props;
	for (const [prop, key] of Object.entries(dataBindings(bindings))) {
		const value = rowValue(row, key);
		if (value !== void 0) materialized[prop] = value;
	}
	return materialized;
}
function materializeNode(node, row) {
	return {
		...node,
		props: materializeProps(node.props, row),
		schema: node.schema?.map((child) => materializeNode(child, row))
	};
}
function materializeSchema(schema, row) {
	return schema?.map((node) => materializeNode(node, row)) ?? [];
}
//#endregion
export { dataBindings, isRecord, materializeNode, materializeProps, materializeSchema, rowValue };

//# sourceMappingURL=materialize.js.map