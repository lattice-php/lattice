import { useT } from "@lattice-php/ui/i18n";
import { Button } from "@lattice-php/ui/button";
import { jsx, jsxs } from "react/jsx-runtime";
import { NativeSelect } from "@lattice-php/ui/native-select";
//#region resources/js/components/pagination.tsx
function TablePagination({ pagination, currentPage, processing, mode, hasNextPage, visiblePages, infiniteLoaderRef, perPageOptions, perPageValue, onPerPage, onPage, onLoadMore }) {
	const { t } = useT("lattice");
	return /* @__PURE__ */ jsxs("div", {
		"data-slot": "table-pagination",
		className: "flex items-center justify-between gap-3 border-t border-lt-border p-4 text-sm",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-4",
			children: [/* @__PURE__ */ jsx("span", { children: pagination.total == null ? t("table.pagination.page", "Page {{page}}", { page: currentPage }) : t("table.pagination.showing", "Showing {{from}}-{{to}} of {{total}}", {
				from: pagination.from ?? 0,
				to: pagination.to ?? 0,
				total: pagination.total
			}) }), perPageOptions.length > 0 && mode !== "none" && /* @__PURE__ */ jsxs("label", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-lt-muted-fg",
					children: t("table.pagination.per-page", "Rows per page")
				}), /* @__PURE__ */ jsx(NativeSelect, {
					"data-test": "pagination-per-page",
					disabled: processing,
					value: String(perPageValue),
					onChange: (event) => onPerPage(event.target.value === "infinite" ? "infinite" : Number(event.target.value)),
					children: perPageOptions.map((option) => /* @__PURE__ */ jsx("option", {
						value: String(option),
						children: option === "infinite" ? t("table.pagination.infinite", "Infinite") : option
					}, String(option)))
				})]
			})]
		}), mode === "infinite" ? /* @__PURE__ */ jsx("div", {
			ref: infiniteLoaderRef,
			className: "flex items-center gap-2",
			children: pagination.hasMore ? /* @__PURE__ */ jsx(Button, {
				emphasis: "outline",
				"data-test": "pagination-load-more",
				disabled: processing,
				onClick: onLoadMore,
				children: processing ? t("table.pagination.loading", "Loading...") : t("table.pagination.load-more", "Load more")
			}) : /* @__PURE__ */ jsx("span", {
				className: "text-lt-muted-fg",
				children: t("table.pagination.all-loaded", "All rows loaded")
			})
		}) : mode === "simple" ? /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ jsx(Button, {
				emphasis: "outline",
				"data-test": "pagination-previous",
				disabled: processing || currentPage <= 1,
				onClick: () => onPage(currentPage - 1),
				children: t("table.pagination.previous", "Previous")
			}), /* @__PURE__ */ jsx(Button, {
				emphasis: "outline",
				"data-test": "pagination-next",
				disabled: processing || !hasNextPage,
				onClick: () => onPage(currentPage + 1),
				children: t("table.pagination.next", "Next")
			})]
		}) : mode === "table" ? /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ jsx(Button, {
					emphasis: "outline",
					"data-test": "pagination-previous",
					disabled: processing || currentPage <= 1,
					onClick: () => onPage(currentPage - 1),
					children: t("table.pagination.previous", "Previous")
				}),
				visiblePages.map((pageNumber) => /* @__PURE__ */ jsx(Button, {
					emphasis: "outline",
					size: "icon",
					"data-test": `pagination-page-${pageNumber}`,
					disabled: processing || pageNumber === currentPage,
					"aria-current": pageNumber === currentPage ? "page" : void 0,
					"aria-label": t("table.pagination.page", "Page {{page}}", { page: pageNumber }),
					onClick: () => onPage(pageNumber),
					children: pageNumber
				}, pageNumber)),
				/* @__PURE__ */ jsx(Button, {
					emphasis: "outline",
					"data-test": "pagination-next",
					disabled: processing || !hasNextPage,
					onClick: () => onPage(currentPage + 1),
					children: t("table.pagination.next", "Next")
				})
			]
		}) : null]
	});
}
//#endregion
export { TablePagination };

//# sourceMappingURL=pagination.js.map