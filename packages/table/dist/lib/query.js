import { isEmptyMember } from "./filter-values.js";
import { translate } from "@lattice-php/ui/i18n";
import { DEFAULT_COLUMN_WIDTH } from "@lattice-php/core/hooks/column-sizing";
//#region resources/js/lib/query.ts
function getColumnSort(query, column) {
	return query.sorts.find((currentSort) => currentSort.key === column.key);
}
function getColumnAriaSort(sort) {
	if (sort?.direction === "asc") return "ascending";
	if (sort?.direction === "desc") return "descending";
}
function buildEndpoint(endpoint, query) {
	const url = new URL(endpoint, window.location.origin);
	if (query.filters.length > 0) url.searchParams.set("filter", serializeFilters(query));
	if (query.sorts.length > 0) url.searchParams.set("sort", serializeSorts(query));
	if (query.search !== "") url.searchParams.set("q", query.search);
	appendTableFilters(url, query.tableFilters);
	url.searchParams.set("page", String(query.page));
	url.searchParams.set("per_page", String(query.perPage));
	if (query.mode != null) url.searchParams.set("mode", query.mode);
	return `${url.pathname}${url.search}`;
}
function appendTableFilters(url, tableFilters) {
	for (const [key, value] of Object.entries(getTableFilterParams(tableFilters))) appendTableFilterParam(url, `tf[${key}]`, value);
}
function getTableFilterParams(tableFilters) {
	const params = {};
	for (const [key, value] of Object.entries(tableFilters)) {
		const normalized = normalizeTableFilterValue(value);
		if (normalized !== void 0) params[key] = normalized;
	}
	return params;
}
function normalizeTableFilterValue(value) {
	if (isEmptyMember(value) || Array.isArray(value) || typeof value !== "object") return;
	const entries = Object.entries(value).map(([subKey, subValue]) => [subKey, normalizeTableFilterMember(subValue)]).filter((entry) => entry[1] !== void 0);
	return entries.length > 0 ? Object.fromEntries(entries) : void 0;
}
function normalizeTableFilterMember(value) {
	if (isEmptyMember(value)) return;
	if (Array.isArray(value)) {
		const values = value.map(normalizeTableFilterMember).filter((item) => item !== void 0);
		return values.length > 0 ? values : void 0;
	}
	if (typeof value === "object") {
		if (value === null) return;
		const entries = Object.entries(value).map(([key, item]) => [key, normalizeTableFilterMember(item)]).filter((entry) => entry[1] !== void 0);
		return entries.length > 0 ? Object.fromEntries(entries) : void 0;
	}
	return String(value);
}
function appendTableFilterParam(url, key, value) {
	if (Array.isArray(value)) {
		for (const item of value) appendTableFilterParam(url, `${key}[]`, item);
		return;
	}
	if (typeof value === "object" && value !== null) {
		for (const [subKey, subValue] of Object.entries(value)) appendTableFilterParam(url, `${key}[${subKey}]`, subValue);
		return;
	}
	url.searchParams.append(key, String(value));
}
function getQueryParams(query) {
	const params = {};
	if (query.filters.length > 0) params.filter = serializeFilters(query);
	if (query.sorts.length > 0) params.sort = serializeSorts(query);
	const tableFilters = getTableFilterParams(query.tableFilters);
	if (Object.keys(tableFilters).length > 0) params.tf = tableFilters;
	if (query.search !== "") params.q = query.search;
	return params;
}
function serializeFilters(query) {
	return query.filters.map((clause) => `${clause.field}:${clause.operator}:${encodeURIComponent(clause.value)}`).join(",");
}
function serializeSorts(query) {
	return query.sorts.map((sort) => sort.direction === "desc" ? `-${sort.key}` : sort.key).join(",");
}
var operatorLabels = {
	contains: "contains",
	starts_with: "starts with",
	ends_with: "ends with",
	eq: "equals",
	neq: "not equals",
	gt: ">",
	gte: "≥",
	lt: "<",
	lte: "≤",
	in: "in",
	not_in: "not in",
	before: "before",
	after: "after",
	empty: "is empty",
	filled: "is not empty"
};
var VALUELESS_FILTER_OPERATORS = /* @__PURE__ */ new Set(["empty", "filled"]);
function operatorLabel(operator) {
	return translate("lattice", `table.operators.${operator}`, operatorLabels[operator] ?? operator);
}
function getSortDirectionLabel(direction) {
	return direction === "desc" ? "descending" : "ascending";
}
function nextSort(sorts, column) {
	if (!column.props.sortable) return sorts;
	const currentSort = sorts.find((sort) => sort.key === column.key);
	const remainingSorts = sorts.filter((sort) => sort.key !== column.key);
	if (!currentSort) return [...sorts, {
		key: column.key,
		direction: "asc"
	}];
	if (currentSort.direction === "asc") return [...remainingSorts, {
		key: column.key,
		direction: "desc"
	}];
	return remainingSorts;
}
function getVisiblePages(currentPage, lastPage) {
	if (lastPage <= 5) return Array.from({ length: lastPage }, (_, index) => index + 1);
	const start = Math.max(1, Math.min(currentPage - 2, lastPage - 4));
	return Array.from({ length: 5 }, (_, index) => start + index);
}
function getTableSizingColumns(columns) {
	return columns.map((column) => ({
		key: column.key,
		label: column.props.label,
		width: columnWidthOrDefault(column)
	}));
}
function columnWidthOrDefault(column) {
	return column.props.width ?? DEFAULT_COLUMN_WIDTH;
}
function getTableUtilityTracks(hasActions, hasSelection, hasExpander = false) {
	return {
		leadingTracks: [...hasExpander ? ["2.5rem"] : [], ...hasSelection ? ["3rem"] : []],
		trailingTracks: hasActions ? ["10rem"] : []
	};
}
//#endregion
export { VALUELESS_FILTER_OPERATORS, buildEndpoint, getColumnAriaSort, getColumnSort, getQueryParams, getSortDirectionLabel, getTableSizingColumns, getTableUtilityTracks, getVisiblePages, nextSort, operatorLabel };

//# sourceMappingURL=query.js.map