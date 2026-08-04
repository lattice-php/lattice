//#region resources/js/lib/filter-values.ts
/**
* Whether a single scalar filter member is absent — the atomic rule the
* filter-emptiness and query-serialization logic both build on.
*/
function isEmptyMember(value) {
	return value == null || value === "";
}
/**
* Whether a table-filter value should clear the filter rather than apply it —
* an empty string, empty list, or an object whose every member is empty.
*/
function isEmptyFilterValue(value) {
	if (isEmptyMember(value)) return true;
	if (Array.isArray(value)) return value.every(isEmptyFilterValue);
	if (typeof value === "object" && value !== null) return Object.values(value).every(isEmptyFilterValue);
	return false;
}
function isActiveFilterValue(value) {
	return !isEmptyFilterValue(value);
}
/**
* Whether a value has the wire shape of a dedicated-filter value: a plain
* `field => value` record.
*/
function isFilterValue(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function filterValue(value) {
	return isFilterValue(value) ? value : {};
}
/**
* Read a string entry from a filter's loose `props` bag, falling back when the
* key is absent or not a string.
*/
function stringProp(filter, key, fallback) {
	const value = filter.props[key];
	return typeof value === "string" ? value : fallback;
}
function filterOptions(filter) {
	const value = filter.props.options;
	return Array.isArray(value) ? value : [];
}
//#endregion
export { filterOptions, filterValue, isActiveFilterValue, isEmptyFilterValue, isEmptyMember, isFilterValue, stringProp };

//# sourceMappingURL=filter-values.js.map