import { apiFetch, apiJson } from "@lattice-php/core/api";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isEmptyFilterValue, isFilterValue } from "@lattice-php/table/lib/filter-values";
import { getColumns, getPagination, getQuery, getRows } from "@lattice-php/table/lib/payload";
import { buildEndpoint, nextSort } from "@lattice-php/table/lib/query";
//#region resources/js/hooks/use-table.ts
function useTable(node) {
	const columns = useMemo(() => getColumns(node.props?.columns), [node.props?.columns]);
	const endpoint = typeof node.props?.endpoint === "string" ? node.props.endpoint : null;
	const componentRef = typeof node.props?.ref === "string" ? node.props.ref : "";
	const isLazy = node.props?.lazy === true;
	const initialQuery = useMemo(() => getQuery(node.props?.query), [node.props?.query]);
	const initialRows = useMemo(() => getRows(node.props?.data), [node.props?.data]);
	const initialPagination = useMemo(() => getPagination(node.props?.pagination), [node.props?.pagination]);
	const [rows, setRows] = useState(initialRows);
	const [pagination, setPagination] = useState(initialPagination);
	const [query, setQuery] = useState(initialQuery);
	const [processing, setProcessing] = useState(isLazy);
	const [hasLoaded, setHasLoaded] = useState(!isLazy);
	const infiniteLoaderRef = useRef(null);
	const currentPage = pagination.currentPage ?? query.page;
	const isInfinite = (pagination.mode ?? "table") === "infinite";
	const load = useCallback(async (nextQuery, append = false) => {
		if (!endpoint) return;
		setProcessing(true);
		try {
			const result = await apiJson(buildEndpoint(endpoint, nextQuery), { ref: componentRef });
			const resultQuery = getQuery(result.query);
			const resultRows = getRows(result.data);
			setRows((currentRows) => append ? [...currentRows, ...resultRows] : resultRows);
			setPagination(getPagination(result.pagination));
			setQuery(resultQuery);
			setHasLoaded(true);
		} finally {
			setProcessing(false);
		}
	}, [endpoint, componentRef]);
	function sort(column) {
		load({
			...query,
			page: 1,
			sorts: nextSort(query.sorts, column)
		});
	}
	function clearSort(sort) {
		load({
			...query,
			page: 1,
			sorts: query.sorts.filter((currentSort) => currentSort.key !== sort.key)
		});
	}
	function applyFilters(next) {
		const nextQuery = {
			...query,
			filters: next,
			page: 1
		};
		setQuery(nextQuery);
		load(nextQuery);
	}
	function addFilter(clause) {
		applyFilters([...query.filters, clause]);
	}
	function updateFilter(index, clause) {
		applyFilters(query.filters.map((current, position) => position === index ? clause : current));
	}
	function removeFilter(index) {
		applyFilters(query.filters.filter((_, current) => current !== index));
	}
	function replaceColumnFilters(field, clauses) {
		applyFilters([...query.filters.filter((clause) => clause.field !== field), ...clauses]);
	}
	function setTableFilter(key, value) {
		const next = { ...query.tableFilters };
		if (isEmptyFilterValue(value) || !isFilterValue(value)) delete next[key];
		else next[key] = value;
		const nextQuery = {
			...query,
			tableFilters: next,
			tableFilterIndicators: query.tableFilterIndicators.filter((indicator) => indicator.filter !== key),
			page: 1
		};
		setQuery(nextQuery);
		load(nextQuery);
	}
	function resetFilters() {
		const nextQuery = {
			...query,
			filters: [],
			tableFilters: {},
			tableFilterIndicators: [],
			search: "",
			page: 1
		};
		setQuery(nextQuery);
		load(nextQuery);
	}
	function setSearch(search) {
		const nextQuery = {
			...query,
			search,
			page: 1
		};
		setQuery(nextQuery);
		load(nextQuery);
	}
	const searchFilterOptions = useCallback(async (searchKey, search, signal) => {
		if (!endpoint) return [];
		const url = new URL(endpoint, window.location.origin);
		url.searchParams.set("_sub", "search");
		url.searchParams.set("_target", searchKey);
		url.searchParams.set("_q", search);
		const response = await apiFetch(`${url.pathname}${url.search}`, {
			ref: componentRef,
			signal,
			throwOnError: false
		});
		if (!response.ok) return [];
		return (await response.json()).options ?? [];
	}, [endpoint, componentRef]);
	function goToPage(page) {
		load({
			...query,
			page
		});
	}
	function setPerPage(option) {
		const definitionMode = initialPagination.mode ?? "table";
		const nextQuery = {
			...query,
			perPage: option === "infinite" ? query.perPage : option,
			mode: option === "infinite" ? "infinite" : definitionMode === "infinite" ? "table" : null,
			page: 1
		};
		setQuery(nextQuery);
		load(nextQuery);
	}
	const loadMore = useCallback(() => {
		if (processing || !pagination.hasMore) return;
		load({
			...query,
			page: pagination.nextPage ?? currentPage + 1
		}, true);
	}, [
		currentPage,
		load,
		pagination.hasMore,
		pagination.nextPage,
		processing,
		query
	]);
	useEffect(() => {
		setRows(initialRows);
		setPagination(initialPagination);
		setQuery(initialQuery);
		setProcessing(isLazy);
		setHasLoaded(!isLazy);
	}, [
		initialRows,
		initialPagination,
		initialQuery,
		isLazy
	]);
	useEffect(() => {
		if (!isLazy || hasLoaded) return;
		load(query);
	}, [
		hasLoaded,
		isLazy,
		load,
		query
	]);
	useWindowEvent(LATTICE_EVENT.reloadComponent, (event) => {
		if (event.detail?.component === node.id) load(query);
	});
	useEffect(() => {
		if (!isInfinite || !pagination.hasMore || processing || !infiniteLoaderRef.current || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) loadMore();
		}, { rootMargin: "240px" });
		observer.observe(infiniteLoaderRef.current);
		return () => observer.disconnect();
	}, [
		isInfinite,
		loadMore,
		pagination.hasMore,
		processing
	]);
	return {
		columns,
		rows,
		pagination,
		query,
		filters: query.filters,
		tableFilters: query.tableFilters,
		search: query.search,
		addFilter,
		updateFilter,
		removeFilter,
		replaceColumnFilters,
		setTableFilter,
		resetFilters,
		setSearch,
		searchFilterOptions,
		processing,
		hasLoaded,
		infiniteLoaderRef,
		sort,
		clearSort,
		goToPage,
		setPerPage,
		loadMore
	};
}
//#endregion
export { useTable };

//# sourceMappingURL=use-table.js.map