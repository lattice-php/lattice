import { DetailPanel } from "./detail-panel.js";
import { useMediaUpload } from "./use-media-upload.js";
import { useRef, useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { Input } from "@lattice-php/ui/input";
import { cn } from "@lattice-php/ui/lib/utils";
import { NativeSelect } from "@lattice-php/ui/native-select";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { runAction } from "@lattice-php/action/lib/run-action";
import { apiFetch } from "@lattice-php/core/api";
import { useTable } from "@lattice-php/table/hooks/use-table";
import { useTableSelection } from "@lattice-php/table/hooks/use-table-selection";
import { getBulkActions } from "@lattice-php/table/lib/bulk";
import { Button } from "@lattice-php/ui/button";
import { Checkbox } from "@lattice-php/ui/checkbox";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { IconButton } from "@lattice-php/ui/icon-button";
import { useDebouncedCallback } from "@lattice-php/ui/lib/use-debounced-callback";
//#region resources/js/components/library-view.tsx
var SEARCH_DEBOUNCE_MS = 300;
function actionNode(node, key) {
	return node.schema?.find((child) => child.key === key);
}
/**
* The grid face of the media table: it drives the same `useTable` state the
* core table component does, so search, filters, infinite paging and the
* `reload-component` effect all behave identically — only the presentation and
* the selection affordances differ.
*/
function LibraryView({ node, pick }) {
	const { t } = useT("media");
	const props = node.props ?? {};
	const tableNode = node.schema?.find((child) => child.type === "table") ?? { type: "table" };
	const table = useTable(tableNode);
	const rows = table.rows;
	const selection = useTableSelection(rows.map((row) => String(row.id)));
	const [deleteAction] = getBulkActions(tableNode.props?.bulkActions);
	const uploadAction = actionNode(node, "media-upload");
	const updateAction = actionNode(node, "media-update");
	const removeAction = actionNode(node, "media-delete");
	const { uploads, addFiles, retry, dismiss } = useMediaUpload({
		endpoint: uploadAction?.props.endpoint ?? "",
		ref: uploadAction?.props.ref ?? "",
		signed: props.signed
	});
	const fileInput = useRef(null);
	const [dragActive, setDragActive] = useState(false);
	const [detailId, setDetailId] = useState(null);
	const detailRow = rows.find((row) => row.id === detailId) ?? null;
	const detail = updateAction && removeAction ? detailRow : null;
	const uploadLabel = uploadAction?.props.label ?? t("media.actions.upload.label", "Upload");
	const acceptsDrop = detail === null;
	const reloading = table.processing && table.hasLoaded;
	const commitSearch = useDebouncedCallback((term) => table.setSearch(term), SEARCH_DEBOUNCE_MS);
	function toggle(row) {
		const key = String(row.id);
		const wasSelected = selection.isSelected(key);
		if (pick && !pick.multiple) {
			selection.clear();
			if (wasSelected) return;
		}
		if (pick?.max !== void 0 && !wasSelected && selection.selectedKeys.length >= pick.max) return;
		selection.toggle(key);
	}
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex flex-col gap-4 rounded-lt-sm border border-dashed border-transparent", dragActive && "border-lt-primary"),
		"data-test": "media-library",
		onDragLeave: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget)) setDragActive(false);
		},
		onDragOver: (event) => {
			event.preventDefault();
			if (!acceptsDrop) return;
			setDragActive(true);
		},
		onDrop: (event) => {
			event.preventDefault();
			setDragActive(false);
			if (!acceptsDrop) return;
			addFiles(event.dataTransfer.files);
		},
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ jsx(Input, {
						className: "max-w-xs",
						"data-test": "media-search",
						defaultValue: table.search,
						onChange: (event) => commitSearch(event.target.value),
						placeholder: t("media.library.search", "Search media"),
						type: "search"
					}),
					/* @__PURE__ */ jsxs(NativeSelect, {
						"aria-label": t("media.filters.type.label", "Type"),
						className: "max-w-40",
						"data-test": "media-type-filter",
						defaultValue: "",
						onChange: (event) => table.setTableFilter("type", { value: event.target.value }),
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "",
								children: t("media.filters.type.all", "All types")
							}),
							/* @__PURE__ */ jsx("option", {
								value: "image",
								children: t("media.filters.type.image", "Images")
							}),
							/* @__PURE__ */ jsx("option", {
								value: "video",
								children: t("media.filters.type.video", "Video")
							}),
							/* @__PURE__ */ jsx("option", {
								value: "audio",
								children: t("media.filters.type.audio", "Audio")
							}),
							/* @__PURE__ */ jsx("option", {
								value: "document",
								children: t("media.filters.type.document", "Documents")
							})
						]
					}),
					uploadAction?.props.endpoint && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
						className: "ms-auto",
						"data-test": "media-upload-button",
						onClick: () => fileInput.current?.click(),
						type: "button",
						variant: "primary",
						children: uploadLabel
					}), /* @__PURE__ */ jsx("input", {
						accept: props.accept ?? void 0,
						"aria-label": uploadLabel,
						className: "sr-only",
						"data-test": "media-upload-input",
						multiple: true,
						onChange: (event) => {
							addFiles(event.target.files);
							event.target.value = "";
						},
						ref: fileInput,
						type: "file"
					})] })
				]
			}),
			uploads.length > 0 && /* @__PURE__ */ jsx("ul", {
				className: "flex flex-wrap gap-2",
				children: uploads.map((item) => /* @__PURE__ */ jsxs("li", {
					className: "flex max-w-64 items-center gap-2 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1 text-sm",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block truncate text-lt-fg",
							children: item.name
						}), item.status === "error" && /* @__PURE__ */ jsx("span", {
							className: "block truncate text-xs text-lt-danger",
							"data-test": "media-upload-reason",
							children: item.reason ?? t("media.library.upload-failed", "Upload failed")
						})]
					}), item.status === "error" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(IconButton, {
						"data-test": "media-upload-retry",
						icon: "rotate-ccw",
						label: t("media.library.upload-retry", "Retry {{name}}", { name: item.name }),
						onClick: () => retry(item)
					}), /* @__PURE__ */ jsx(IconButton, {
						"data-test": "media-upload-dismiss",
						icon: "x",
						label: t("media.library.upload-dismiss", "Dismiss {{name}}", { name: item.name }),
						onClick: () => dismiss(item.id)
					})] }) : /* @__PURE__ */ jsx("span", {
						className: "text-lt-muted-fg",
						children: `${item.progress}%`
					})]
				}, item.id))
			}),
			rows.length === 0 && table.hasLoaded ? /* @__PURE__ */ jsx("p", {
				className: "py-12 text-center text-sm text-lt-muted-fg",
				"data-test": "media-empty",
				children: table.search !== "" || Object.keys(table.tableFilters).length > 0 ? t("media.library.no-results", "No media matches your search.") : t("media.library.empty", "No media yet. Drop files anywhere to upload.")
			}) : /* @__PURE__ */ jsx("ul", {
				"aria-busy": reloading,
				className: cn("grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-5", reloading && "opacity-60"),
				"data-test": "media-grid",
				children: rows.map((row) => /* @__PURE__ */ jsxs("li", {
					className: "relative",
					children: [/* @__PURE__ */ jsxs("button", {
						className: cn("flex w-full flex-col overflow-hidden rounded-lt-sm border border-lt-border bg-lt-surface text-left", selection.isSelected(String(row.id)) && "ring-[length:var(--lt-ring-width)] ring-lt-ring"),
						"data-test": "media-card",
						onClick: () => pick ? toggle(row) : setDetailId(row.id),
						type: "button",
						children: [row.preview_url !== null && row.mime_type.startsWith("image/") ? /* @__PURE__ */ jsx("img", {
							alt: row.alt ?? row.name,
							className: "aspect-square w-full object-cover",
							src: row.preview_url
						}) : /* @__PURE__ */ jsx("span", {
							className: "flex aspect-square w-full items-center justify-center text-sm text-lt-muted-fg",
							children: row.mime_type.split("/")[1] ?? row.mime_type
						}), /* @__PURE__ */ jsx("span", {
							className: "truncate px-2 py-1.5 text-sm text-lt-fg",
							children: row.name
						})]
					}), /* @__PURE__ */ jsx(Checkbox, {
						"aria-label": t("media.library.select", "Select {{name}}", { name: row.name }),
						checked: selection.isSelected(String(row.id)),
						className: "absolute left-2 top-2 bg-lt-surface",
						"data-test": "media-card-select",
						onCheckedChange: () => toggle(row)
					})]
				}, row.id))
			}),
			/* @__PURE__ */ jsx("div", { ref: table.infiniteLoaderRef }),
			pick ? /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-end gap-3 border-t border-lt-border pt-3",
				children: [pick.max !== void 0 && /* @__PURE__ */ jsx("span", {
					className: cn("text-sm text-lt-muted-fg", selection.selectedKeys.length >= pick.max && "text-lt-danger"),
					"data-test": "media-pick-counter",
					children: t("media.picker.selected-of-max", "{{count}}/{{max}} selected", {
						count: selection.selectedKeys.length,
						max: pick.max
					})
				}), /* @__PURE__ */ jsx(Button, {
					"data-test": "media-pick-confirm",
					disabled: !selection.active,
					onClick: () => pick.onConfirm(rows.filter((row) => selection.isSelected(String(row.id)))),
					type: "button",
					variant: "primary",
					children: t("media.picker.confirm", "Select {{count}} item(s)", { count: selection.selectedKeys.length })
				})]
			}) : deleteAction && selection.active && /* @__PURE__ */ jsx(BulkDeleteBar, {
				action: deleteAction,
				onDone: selection.clear,
				selectedKeys: selection.selectedKeys
			}),
			detail && updateAction && removeAction && /* @__PURE__ */ jsx(DetailPanel, {
				onClose: () => setDetailId(null),
				remove: removeAction,
				row: detail,
				update: updateAction
			}, detail.id)
		]
	});
}
function BulkDeleteBar({ action, selectedKeys, onDone }) {
	const { t } = useT("media");
	const dispatch = useEffectDispatcher();
	const [processing, setProcessing] = useState(false);
	async function submit() {
		setProcessing(true);
		const ok = await runAction(() => apiFetch(action.endpoint, {
			method: action.method,
			ref: action.ref,
			body: JSON.stringify({ selected: selectedKeys }),
			throwOnError: false
		}), dispatch);
		setProcessing(false);
		if (ok) onDone();
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "sticky bottom-0 z-lt-sticky flex items-center justify-between gap-3 rounded-lt-sm border border-lt-border bg-lt-surface px-4 py-3 text-sm shadow-lt-md",
		children: [/* @__PURE__ */ jsx("span", { children: t("media.library.selected", "{{count}} selected", { count: selectedKeys.length }) }), /* @__PURE__ */ jsx(Button, {
			"data-test": "media-bulk-delete",
			disabled: processing,
			emphasis: action.emphasis ?? "solid",
			onClick: () => void submit(),
			type: "button",
			variant: action.variant ?? "danger",
			children: action.label
		})]
	});
}
//#endregion
export { LibraryView };

//# sourceMappingURL=library-view.js.map