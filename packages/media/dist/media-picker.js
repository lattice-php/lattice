import { LibraryView } from "./components/library-view.js";
import { RenderNode } from "@lattice-php/core";
import { useState } from "react";
import { translate, useT } from "@lattice-php/ui/i18n";
import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@lattice-php/ui/button";
import { IconButton } from "@lattice-php/ui/icon-button";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/dialog";
import { SimpleField } from "@lattice-php/form/components/fields/simple-field";
import { FieldScopeProvider } from "@lattice-php/form/hooks/field-scope";
//#region resources/js/media-picker.tsx
var MediaPickerComponent = ({ node }) => {
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
//#endregion
export { MediaPickerComponent as default };

//# sourceMappingURL=media-picker.js.map