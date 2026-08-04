import { useState } from "react";
import { translate, useT } from "@lattice-php/ui/i18n";
import { Input } from "@lattice-php/ui/input";
import { jsx, jsxs } from "react/jsx-runtime";
import { runAction } from "@lattice-php/action/lib/run-action";
import { apiFetch } from "@lattice-php/core/api";
import { Button } from "@lattice-php/ui/button";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { formatDateValue } from "@lattice-php/ui/format/date-time";
import { useFormatContext } from "@lattice-php/ui/format/format-context";
import { ConfirmDialog } from "@lattice-php/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/dialog";
import { PreviewableImage } from "@lattice-php/ui/image-preview";
import { Label } from "@lattice-php/ui/label";
//#region resources/js/components/detail-panel.tsx
var byteUnits = [
	"byte",
	"kilobyte",
	"megabyte",
	"gigabyte",
	"terabyte"
];
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
//#endregion
export { DetailPanel };

//# sourceMappingURL=detail-panel.js.map