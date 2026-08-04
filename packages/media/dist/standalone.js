import { RenderNode, lazyComponent } from "@lattice-php/lattice/runtime";
import { Suspense, lazy, useRef, useState } from "react";
import { Node, mergeAttributes } from "@lattice-php/lattice/runtime";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@lattice-php/lattice/runtime";
import { ToolbarIconButton, registerRichEditorExtension } from "@lattice-php/lattice/runtime";
import { translate, useT } from "@lattice-php/lattice/runtime";
import { Input } from "@lattice-php/lattice/runtime";
import { cn } from "@lattice-php/lattice/runtime";
import { NativeSelect } from "@lattice-php/lattice/runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/lattice/runtime";
import { runAction } from "@lattice-php/lattice/runtime";
import { apiFetch, xsrfToken } from "@lattice-php/lattice/runtime";
import { useTable } from "@lattice-php/lattice/runtime";
import { useTableSelection } from "@lattice-php/lattice/runtime";
import { getBulkActions } from "@lattice-php/lattice/runtime";
import { Button } from "@lattice-php/lattice/runtime";
import { Checkbox } from "@lattice-php/lattice/runtime";
import { useEffectDispatcher } from "@lattice-php/lattice/runtime";
import { IconButton } from "@lattice-php/lattice/runtime";
import { useDebouncedCallback } from "@lattice-php/lattice/runtime";
import { formatDateValue } from "@lattice-php/lattice/runtime";
import { useFormatContext } from "@lattice-php/lattice/runtime";
import { ConfirmDialog } from "@lattice-php/lattice/runtime";
import { PreviewableImage } from "@lattice-php/lattice/runtime";
import { Label } from "@lattice-php/lattice/runtime";
import { withHeaders } from "@lattice-php/lattice/runtime";
import { requestSignedUpload, xhrTransfer } from "@lattice-php/lattice/runtime";
import { SimpleField } from "@lattice-php/lattice/runtime";
import { FieldScopeProvider } from "@lattice-php/lattice/runtime";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region resources/js/components/detail-panel.tsx
function formatSize(bytes, locale) {
	const exponent = bytes > 0 ? Math.min(Math.floor(Math.log10(bytes) / 3), byteUnits.length - 1) : 0;
	return new Intl.NumberFormat(locale, {
		style: "unit",
		unit: byteUnits[exponent],
		maximumFractionDigits: exponent === 0 ? 0 : 1
	}).format(bytes / 1e3 ** exponent);
}
/**
* The slideout behind a card click: preview, metadata, and the two per-file
* actions. Both requests carry `media_id`, so one runner covers them.
*/
function DetailPanel({ row, update, remove, onClose }) {
	const { t } = useT("media");
	const { locale, timezone } = useFormatContext();
	const dispatch = useEffectDispatcher();
	const [name, setName] = useState(row.name);
	const [alt, setAlt] = useState(row.alt ?? "");
	const [processing, setProcessing] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const deleteLabel = t("media.actions.delete.label", "Delete");
	async function run(action, payload = {}) {
		setProcessing(true);
		const ok = await runAction(() => apiFetch(action.props.endpoint ?? "", {
			method: action.props.method ?? "post",
			ref: action.props.ref ?? "",
			body: JSON.stringify({
				media_id: row.id,
				...payload
			}),
			throwOnError: false
		}), dispatch);
		setProcessing(false);
		if (ok) onClose();
	}
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		children: /* @__PURE__ */ jsxs(DialogContent, {
			"aria-describedby": void 0,
			className: "flex flex-col gap-5",
			"data-test": "media-detail",
			placement: "end",
			width: "md",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, {
					closeLabel: translate("lattice", "common.close", "Close"),
					title: row.name
				}),
				row.url !== null && row.mime_type.startsWith("image/") ? /* @__PURE__ */ jsx(PreviewableImage, {
					alt: row.alt ?? row.name,
					className: "h-64 w-full rounded-lt-sm object-contain",
					previewable: true,
					src: row.url,
					testId: "media-detail-preview"
				}) : /* @__PURE__ */ jsx("p", {
					className: "flex h-32 items-center justify-center rounded-lt-sm border border-lt-border text-sm text-lt-muted-fg",
					children: row.mime_type
				}),
				/* @__PURE__ */ jsxs("dl", {
					className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm",
					children: [
						/* @__PURE__ */ jsx("dt", {
							className: "text-lt-muted-fg",
							children: t("media.columns.type", "Type")
						}),
						/* @__PURE__ */ jsx("dd", {
							className: "text-lt-fg",
							children: row.mime_type
						}),
						/* @__PURE__ */ jsx("dt", {
							className: "text-lt-muted-fg",
							children: t("media.columns.size", "Size")
						}),
						/* @__PURE__ */ jsx("dd", {
							className: "text-lt-fg",
							children: formatSize(row.size, locale)
						}),
						/* @__PURE__ */ jsx("dt", {
							className: "text-lt-muted-fg",
							children: t("media.columns.uploaded-at", "Uploaded")
						}),
						/* @__PURE__ */ jsx("dd", {
							className: "text-lt-fg",
							children: formatDateValue(row.created_at, {
								dateStyle: "medium",
								timeStyle: "short"
							}, {
								locale,
								timeZone: timezone
							})
						}),
						/* @__PURE__ */ jsx("dt", {
							className: "text-lt-muted-fg",
							children: t("media.columns.usage", "Used")
						}),
						/* @__PURE__ */ jsx("dd", {
							className: "text-lt-fg",
							children: row.attachments_count
						})
					]
				}),
				/* @__PURE__ */ jsxs(Label, {
					className: "grid gap-1.5",
					children: [t("media.columns.name", "Name"), /* @__PURE__ */ jsx(Input, {
						"data-test": "media-detail-name",
						maxLength: 255,
						onChange: (event) => setName(event.target.value),
						value: name
					})]
				}),
				/* @__PURE__ */ jsxs(Label, {
					className: "grid gap-1.5",
					children: [t("media.columns.alt", "Alt text"), /* @__PURE__ */ jsx(Input, {
						"data-test": "media-detail-alt",
						maxLength: 255,
						onChange: (event) => setAlt(event.target.value),
						value: alt
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ jsx(Button, {
							"data-test": "media-detail-save",
							disabled: processing || name.trim() === "",
							onClick: () => void run(update, {
								name,
								alt: alt === "" ? null : alt
							}),
							type: "button",
							variant: "primary",
							children: t("media.detail.save", "Save")
						}),
						row.url !== null && /* @__PURE__ */ jsx("a", {
							className: "text-sm text-lt-primary underline underline-offset-2",
							href: row.url,
							rel: "noreferrer",
							target: "_blank",
							children: t("media.detail.download", "Download")
						}),
						/* @__PURE__ */ jsx(Button, {
							className: "ms-auto",
							"data-test": "media-detail-delete",
							disabled: processing,
							onClick: () => setConfirming(true),
							type: "button",
							variant: "danger",
							children: deleteLabel
						})
					]
				}),
				confirming && /* @__PURE__ */ jsx(ConfirmDialog, {
					cancelLabel: translate("lattice", "common.cancel", "Cancel"),
					confirmLabel: deleteLabel,
					confirmVariant: "danger",
					description: t("media.actions.delete.confirm-description", "This file is attached to {{count}} record(s). Deleting removes it everywhere.", { count: row.attachments_count }),
					onCancel: () => setConfirming(false),
					onConfirm: () => void run(remove),
					processing,
					title: t("media.actions.delete.confirm-title", "Delete this file?")
				})
			]
		})
	});
}
var byteUnits;
var init_detail_panel = __esmMin((() => {
	byteUnits = [
		"byte",
		"kilobyte",
		"megabyte",
		"gigabyte",
		"terabyte"
	];
}));
//#endregion
//#region resources/js/components/use-media-upload.ts
/** Laravel reports a rejected file under `files.<index>`; `message` covers request-level failures. */
function reasonFor({ body }, index) {
	return body.errors?.[`files.${index}`]?.[0] ?? body.message;
}
/**
* Drives the media library's uploads. Each file gets its own request, so
* progress and validation failures are per file. A settled item leaves the
* list — a single batched `reload-component` effect, dispatched once the whole
* batch has settled, brings the new rows into the grid — so `uploads` only
* ever holds in-flight and failed files.
*/
function useMediaUpload({ endpoint, ref, signed }) {
	const dispatch = useEffectDispatcher();
	const { t } = useT("media");
	const [uploads, setUploads] = useState([]);
	function update(id, changes) {
		setUploads((previous) => previous.map((item) => item.id === id ? {
			...item,
			...changes
		} : item));
	}
	function remove(id) {
		setUploads((previous) => previous.filter((item) => item.id !== id));
	}
	function settle(item, settled, index) {
		if (settled.ok) {
			remove(item.id);
			return;
		}
		update(item.id, {
			status: "error",
			reason: reasonFor(settled, index)
		});
	}
	/**
	* `runAction` consumes the response body, so it is teed here: the parsed body
	* carries the failure reason and, for a signed upload, the signature itself.
	* `toast` and `reload-component` effects are dropped because one per file would
	* stack N toasts and N table reloads — the batch dispatches one of each once
	* every file has settled, reusing whichever settled response carried a reload.
	*/
	async function send(request) {
		let body = {};
		let reload;
		return {
			ok: await runAction(async () => {
				const response = await request();
				body = await response.clone().json().catch(() => ({}));
				return response;
			}, (effects) => {
				reload = effects.find((effect) => effect.type === "reload-component");
				dispatch(effects.filter((effect) => effect.type !== "toast" && effect.type !== "reload-component"));
			}),
			body,
			reload
		};
	}
	async function uploadMultipart(item) {
		const body = new FormData();
		body.append("files[]", item.file);
		const settled = await send(() => xhrTransfer({
			url: endpoint,
			method: "POST",
			body,
			headers: withHeaders(ref, {
				Accept: "application/json",
				"X-Requested-With": "XMLHttpRequest",
				"X-XSRF-TOKEN": xsrfToken()
			}),
			onProgress: (progress) => update(item.id, { progress })
		}));
		settle(item, settled, 0);
		return {
			ok: settled.ok,
			reload: settled.reload
		};
	}
	async function signAndPut(item) {
		const signature = await send(() => requestSignedUpload(endpoint, {
			ref,
			target: "files",
			filename: item.file.name,
			contentType: item.file.type
		}));
		if (!signature.ok) {
			settle(item, signature, 0);
			return null;
		}
		const sign = signature.body;
		if ((await xhrTransfer({
			url: sign.url,
			method: sign.method.toUpperCase(),
			body: item.file,
			headers: sign.headers,
			onProgress: (progress) => update(item.id, { progress })
		}).catch(() => null))?.ok === true) return sign.key;
		settle(item, {
			ok: false,
			body: {}
		}, 0);
		return null;
	}
	async function uploadSigned(items) {
		const keys = await Promise.all(items.map(signAndPut));
		const uploaded = keys.filter((key) => key !== null);
		if (uploaded.length === 0) return items.map(() => ({ ok: false }));
		const settled = await send(() => apiFetch(endpoint, {
			method: "POST",
			ref,
			body: JSON.stringify({ files: uploaded }),
			throwOnError: false
		}));
		items.filter((_, index) => keys[index] !== null).forEach((item, index) => settle(item, settled, index));
		return keys.map((key) => ({
			ok: key !== null && settled.ok,
			reload: settled.reload
		}));
	}
	async function run(items) {
		const outcomes = signed ? await uploadSigned(items) : await Promise.all(items.map(uploadMultipart));
		const count = outcomes.filter((outcome) => outcome.ok).length;
		if (count === 0) return;
		const reload = outcomes.find((outcome) => outcome.reload)?.reload;
		dispatch([{
			type: "toast",
			props: { message: t("media.library.uploaded", "{{count}} file(s) uploaded", { count }) }
		}, ...reload ? [reload] : []]);
	}
	function addFiles(incoming) {
		const files = Array.from(incoming ?? []);
		if (files.length === 0 || endpoint === "") return;
		const items = files.map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			status: "uploading",
			progress: 0,
			file
		}));
		setUploads((previous) => [...previous, ...items]);
		run(items);
	}
	function retry(item) {
		update(item.id, {
			status: "uploading",
			progress: 0,
			reason: void 0
		});
		run([item]);
	}
	return {
		uploads,
		addFiles,
		retry,
		dismiss: remove
	};
}
var init_use_media_upload = __esmMin((() => {}));
//#endregion
//#region resources/js/components/library-view.tsx
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
var SEARCH_DEBOUNCE_MS;
var init_library_view = __esmMin((() => {
	init_detail_panel();
	init_use_media_upload();
	SEARCH_DEBOUNCE_MS = 300;
}));
//#endregion
//#region resources/js/rich-editor/media-image-dialog.tsx
var media_image_dialog_exports = /* @__PURE__ */ __exportAll({ default: () => MediaImageDialog$1 });
/**
* The picker dialog body for the media-image toolbar control, split out of
* media-image.tsx so it (and the media-library grid stack it pulls in) loads
* lazily instead of riding in the eager editor-extension bundle.
*/
function MediaImageDialog$1({ editor, library, setOpen }) {
	const { t } = useT("media");
	return /* @__PURE__ */ jsx(Dialog, {
		onOpenChange: setOpen,
		open: true,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			"aria-describedby": void 0,
			className: "flex flex-col gap-5",
			"data-test": "editor-media-image-dialog",
			width: "3xl",
			children: [/* @__PURE__ */ jsx(DialogHeader, {
				closeLabel: translate("lattice", "common.close", "Close"),
				title: t("media.picker.heading", "Choose media")
			}), /* @__PURE__ */ jsx(LibraryView, {
				node: library,
				pick: {
					multiple: true,
					onConfirm: (items) => {
						editor.chain().focus().insertContent(items.map((item) => ({
							type: "mediaImage",
							attrs: {
								id: item.id,
								url: item.url,
								mediaAlt: item.alt
							}
						}))).run();
						setOpen(false);
					}
				}
			})]
		})
	});
}
var init_media_image_dialog = __esmMin((() => {
	init_library_view();
}));
//#endregion
//#region resources/js/rich-editor/media-image.tsx
var MediaImageDialog = lazy(() => Promise.resolve().then(() => (init_media_image_dialog(), media_image_dialog_exports)));
function MediaImageView({ editor, extension, node, selected, updateAttributes }) {
	const { t } = useT("media");
	const conversions = extension.options.conversions;
	const url = node.attrs.url;
	const alt = node.attrs.alt ?? node.attrs.mediaAlt ?? "";
	return /* @__PURE__ */ jsxs(NodeViewWrapper, {
		className: "flex flex-col gap-2",
		"data-test": "editor-media-image",
		children: [url ? /* @__PURE__ */ jsx("img", {
			alt,
			className: cn("max-w-full rounded-lt-sm", selected && "ring-2 ring-lt-ring"),
			src: url
		}) : /* @__PURE__ */ jsx("div", {
			className: "rounded-lt-sm border border-dashed border-lt-border px-3 py-2 text-sm text-lt-fg-muted",
			"data-test": "editor-media-image-missing",
			children: t("media.editor.missing", "Missing media")
		}), selected && editor.isEditable && /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			"data-test": "editor-media-image-controls",
			children: [/* @__PURE__ */ jsx(Input, {
				"aria-label": t("media.editor.alt", "Alt text"),
				onChange: (event) => updateAttributes({ alt: event.target.value === "" ? null : event.target.value }),
				placeholder: t("media.editor.alt", "Alt text"),
				value: node.attrs.alt ?? ""
			}), conversions.length > 0 && /* @__PURE__ */ jsxs(NativeSelect, {
				"aria-label": t("media.editor.size", "Size"),
				onChange: (event) => updateAttributes({ conversion: event.target.value === "" ? null : event.target.value }),
				value: node.attrs.conversion ?? "",
				children: [/* @__PURE__ */ jsx("option", {
					value: "",
					children: t("media.editor.original", "Original")
				}), conversions.map((name) => /* @__PURE__ */ jsx("option", {
					value: name,
					children: name
				}, name))]
			})]
		})]
	});
}
var MediaImageNode = Node.create({
	name: "mediaImage",
	group: "block",
	atom: true,
	draggable: true,
	addOptions() {
		return { conversions: [] };
	},
	addAttributes() {
		return {
			id: { default: null },
			alt: { default: null },
			conversion: { default: null },
			url: { default: null },
			width: { default: null },
			height: { default: null },
			mediaAlt: { default: null }
		};
	},
	parseHTML() {
		return [{ tag: "img[data-media-id]" }];
	},
	renderHTML({ node, HTMLAttributes }) {
		return ["img", mergeAttributes(HTMLAttributes, {
			src: node.attrs.url,
			alt: node.attrs.alt ?? node.attrs.mediaAlt ?? "",
			"data-media-id": node.attrs.id
		})];
	},
	addNodeView() {
		return ReactNodeViewRenderer(MediaImageView);
	}
});
function InsertMediaImageControl({ editor, library }) {
	const { t } = useT("media");
	const [open, setOpen] = useState(false);
	if (!library) return null;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ToolbarIconButton, {
		icon: "image",
		label: t("media.editor.insert", "Insert image"),
		onClick: () => setOpen(true),
		testId: "editor-media-image-insert"
	}), open && /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: /* @__PURE__ */ jsx(MediaImageDialog, {
			editor,
			library,
			setOpen
		})
	})] });
}
function registerMediaImage() {
	registerRichEditorExtension("media-image", {
		extensions: (props) => [MediaImageNode.configure({ conversions: props.conversions ?? [] })],
		toolbar: (props) => [{
			key: "media-image",
			component: ({ editor }) => /* @__PURE__ */ jsx(InsertMediaImageControl, {
				editor,
				library: props.library ?? null
			})
		}]
	});
}
//#endregion
//#region resources/js/library.tsx
var library_exports = /* @__PURE__ */ __exportAll({ default: () => MediaLibraryComponent });
var MediaLibraryComponent;
var init_library = __esmMin((() => {
	init_library_view();
	MediaLibraryComponent = ({ node }) => /* @__PURE__ */ jsx(LibraryView, { node });
}));
//#endregion
//#region resources/js/media-picker.tsx
var media_picker_exports = /* @__PURE__ */ __exportAll({ default: () => MediaPickerComponent });
var MediaPickerComponent;
var init_media_picker = __esmMin((() => {
	init_library_view();
	MediaPickerComponent = ({ node }) => {
		const { t } = useT("media");
		const props = node.props;
		const [open, setOpen] = useState(false);
		const [picked, setPicked] = useState((props.selected ?? []).map((entry) => ({
			...entry,
			values: entry.values ?? {}
		})));
		const libraryNode = node.schema?.find((child) => child.type === "media.library");
		const template = node.schema?.filter((child) => child.type !== "media.library") ?? [];
		const hasFields = template.length > 0;
		const multiple = props.multiple;
		const maxFiles = props.maxFiles;
		const remaining = multiple && maxFiles !== null ? Math.max(0, maxFiles - picked.length) : void 0;
		return /* @__PURE__ */ jsx(SimpleField, {
			label: props.label ?? "",
			node,
			children: ({ name, commit, disabled, readOnly }) => {
				const locked = disabled || readOnly;
				const valueOf = (rows) => hasFields ? rows.map((entry) => ({
					id: entry.id,
					...entry.values
				})) : multiple ? rows.map((entry) => entry.id) : rows[0]?.id ?? "";
				const apply = (next) => {
					setPicked(next);
					commit(valueOf(next));
				};
				const setRowValue = (index, field, value) => {
					apply(picked.map((row, i) => i === index ? {
						...row,
						values: {
							...row.values,
							[field]: value
						}
					} : row));
				};
				return /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					"data-test": `media-picker-${name}`,
					children: [
						hasFields ? picked.map((item, index) => /* @__PURE__ */ jsx("input", {
							name: `${name}[${index}][id]`,
							type: "hidden",
							value: item.id
						}, item.id)) : multiple ? picked.map((item) => /* @__PURE__ */ jsx("input", {
							name: `${name}[]`,
							type: "hidden",
							value: item.id
						}, item.id)) : /* @__PURE__ */ jsx("input", {
							name,
							type: "hidden",
							value: picked[0]?.id ?? ""
						}),
						picked.length > 0 && /* @__PURE__ */ jsx("ul", {
							className: hasFields ? "flex flex-col gap-2" : "flex flex-wrap gap-2",
							children: picked.map((item, index) => /* @__PURE__ */ jsxs("li", {
								className: hasFields ? "flex flex-col gap-3 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-2 text-sm" : "flex max-w-56 items-center gap-2 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1 text-sm",
								"data-test": "media-picker-item",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										item.preview_url !== null && item.mime_type.startsWith("image/") && /* @__PURE__ */ jsx("img", {
											alt: "",
											className: "size-8 rounded-lt-xs object-cover",
											src: item.preview_url
										}),
										/* @__PURE__ */ jsx("span", {
											className: "truncate text-lt-fg",
											children: item.name
										}),
										!locked && /* @__PURE__ */ jsx(IconButton, {
											"data-test": "media-picker-remove",
											icon: "x",
											label: t("media.picker.remove", "Remove {{name}}", { name: item.name }),
											onClick: () => apply(picked.filter((entry) => entry.id !== item.id))
										})
									]
								}), hasFields && !disabled && /* @__PURE__ */ jsx(FieldScopeProvider, {
									base: name,
									index,
									onChange: (field, value) => setRowValue(index, field, value),
									row: {
										id: item.id,
										...item.values
									},
									children: /* @__PURE__ */ jsx("div", {
										className: "flex flex-col gap-3",
										"data-test": "media-picker-item-fields",
										children: template.map((child, childIndex) => /* @__PURE__ */ jsx(RenderNode, { node: child }, childIndex))
									})
								})]
							}, item.id))
						}),
						/* @__PURE__ */ jsx(Button, {
							className: "self-start",
							"data-test": "media-picker-open",
							disabled: locked,
							onClick: () => setOpen(true),
							type: "button",
							children: t("media.picker.open", "Choose from library")
						}),
						open && libraryNode && /* @__PURE__ */ jsx(Dialog, {
							onOpenChange: setOpen,
							open: true,
							children: /* @__PURE__ */ jsxs(DialogContent, {
								"aria-describedby": void 0,
								className: "flex flex-col gap-5",
								"data-test": "media-picker-dialog",
								width: "3xl",
								children: [/* @__PURE__ */ jsx(DialogHeader, {
									closeLabel: translate("lattice", "common.close", "Close"),
									title: t("media.picker.heading", "Choose media")
								}), /* @__PURE__ */ jsx(LibraryView, {
									node: libraryNode,
									pick: {
										multiple,
										max: remaining,
										onConfirm: (items) => {
											const incoming = items.map((item) => ({
												...item,
												values: picked.find((entry) => entry.id === item.id)?.values ?? {}
											}));
											const merged = multiple ? [...picked.filter((entry) => !incoming.some((item) => item.id === entry.id)), ...incoming] : incoming.slice(0, 1);
											apply(multiple && maxFiles !== null ? merged.slice(0, maxFiles) : merged);
											setOpen(false);
										}
									}
								})]
							})
						})
					]
				});
			}
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
registerMediaImage();
var plugin_default = {
	name: "media",
	components: {
		"media.library": lazyComponent(() => Promise.resolve().then(() => (init_library(), library_exports))),
		"field.media-picker": lazyComponent(() => Promise.resolve().then(() => (init_media_picker(), media_picker_exports)))
	},
	i18n: { namespace: "media" }
};
//#endregion
export { plugin_default as default };

//# sourceMappingURL=standalone.js.map