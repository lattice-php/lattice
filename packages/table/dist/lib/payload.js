//#region resources/js/lib/payload.ts
function getFilters(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((clause) => typeof clause === "object" && clause !== null && typeof clause.field === "string" && typeof clause.operator === "string" && typeof clause.value === "string");
}
function getColumns(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((column) => typeof column === "object" && column !== null && "key" in column && "props" in column && typeof column.key === "string" && typeof column.props === "object" && column.props !== null && typeof column.props.label === "string");
}
function getRows(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((row) => typeof row === "object" && row !== null && !Array.isArray(row));
}
var EMPTY_PAGINATION = {
	mode: "none",
	currentPage: null,
	lastPage: null,
	perPage: null,
	total: null,
	from: null,
	to: null,
	hasMore: false,
	nextPage: null
};
function getPagination(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return EMPTY_PAGINATION;
	return value;
}
function getQuery(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return {
		filters: [],
		sorts: [],
		page: 1,
		perPage: 25,
		tableFilters: {},
		tableFilterIndicators: [],
		search: "",
		mode: null
	};
	const query = value;
	return {
		filters: getFilters(query.filters),
		sorts: Array.isArray(query.sorts) ? query.sorts : [],
		page: typeof query.page === "number" ? query.page : 1,
		perPage: typeof query.perPage === "number" ? query.perPage : 25,
		tableFilters: getTableFilters(query.tableFilters),
		tableFilterIndicators: getTableFilterIndicators(query.tableFilterIndicators),
		search: typeof query.search === "string" ? query.search : "",
		mode: getPaginationMode(query.mode)
	};
}
var PAGINATION_MODES = /* @__PURE__ */ new Set([
	"none",
	"simple",
	"table",
	"infinite"
]);
function getPaginationMode(value) {
	return typeof value === "string" && PAGINATION_MODES.has(value) ? value : null;
}
function getPerPageOptions(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((option) => typeof option === "number" || option === "infinite");
}
/**
* The wire serializes an empty filter map as `[]` and a populated one as an
* object, so coerce both to a plain `key => value` record.
*/
function getTableFilters(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
	return Object.fromEntries(Object.entries(value).filter((entry) => typeof entry[1] === "object" && entry[1] !== null && !Array.isArray(entry[1])));
}
function getTableFilterIndicators(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((indicator) => typeof indicator === "object" && indicator !== null && typeof indicator.filter === "string" && typeof indicator.label === "string" && typeof indicator.value === "string");
}
function getRowKey(row, index) {
	const key = row.id ?? row.uuid ?? row.key ?? index;
	return String(key);
}
function getRowActions(row) {
	return Array.isArray(row.actions) ? row.actions : [];
}
function getRowDetail(row) {
	const detail = row.detail;
	return typeof detail === "object" && detail !== null && !Array.isArray(detail) ? detail : null;
}
//#endregion
export { getColumns, getPagination, getPerPageOptions, getQuery, getRowActions, getRowDetail, getRowKey, getRows };

//# sourceMappingURL=payload.js.map