import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { jsx, jsxs } from "react/jsx-runtime";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useFormValues, useSetFormValue } from "@lattice-php/form/hooks/values";
import { testIdentity } from "@lattice-php/core/test-id";
import { requestSignedUpload, xhrTransfer } from "@lattice-php/core/upload";
import { IconButton } from "@lattice-php/ui/icon-button";
//#region resources/js/components/fields/file-upload.tsx
function uploadValueEquals(current, next) {
	if (Array.isArray(next)) return Array.isArray(current) && current.length === next.length && current.every((value, index) => value === next[index]);
	return current === next;
}
var FileUploadComponent = ({ node }) => {
	const { t } = useT("lattice");
	const props = node.props;
	const { hidden, required, readOnly, disabled } = useDependentField(node);
	const { action, componentRef, errors } = useFormContext();
	const name = props.name;
	const scope = useFieldScope();
	const domName = scope ? scope.scopedName(name) : name;
	const errorKey = scope ? scope.errorKey(name) : name;
	const uploadKey = errorKey;
	const values = useFormValues();
	const setValue = useSetFormValue();
	const inputId = useId();
	const fileInputRef = useRef(null);
	const previewUrlsRef = useRef(/* @__PURE__ */ new Set());
	const locked = readOnly || disabled;
	const signed = props.signed;
	const multiple = props.multiple;
	const fieldName = multiple ? `${domName}[]` : domName;
	const initial = useMemo(() => (props.files ?? []).map((file) => ({
		id: crypto.randomUUID(),
		name: file.name,
		size: file.size,
		status: "ready",
		progress: 100,
		key: file.key,
		url: file.url,
		token: file.token,
		existing: true
	})), [props.files]);
	const [items, setItems] = useState(initial);
	const [removedTokens, setRemovedTokens] = useState([]);
	useEffect(() => {
		if (!signed) return;
		const keys = items.filter((item) => !item.existing && item.key && item.status === "ready").map((item) => item.key);
		const next = multiple ? keys : keys[0] ?? "";
		if (scope) {
			if (!uploadValueEquals(scope.getValue(name), next)) scope.setValue(name, next);
			return;
		}
		setValue(name, next);
	}, [
		items,
		multiple,
		name,
		scope,
		setValue,
		signed
	]);
	useEffect(() => {
		if (!signed || scope) return;
		setValue(`${name}__removed`, removedTokens);
	}, [
		name,
		removedTokens,
		scope,
		setValue,
		signed
	]);
	useEffect(() => () => {
		previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
		previewUrlsRef.current.clear();
	}, []);
	const multipartFiles = useMemo(() => items.filter((item) => item.file && !item.existing).map((item) => item.file), [items]);
	useEffect(() => {
		if (signed || !fileInputRef.current) return;
		const transfer = new DataTransfer();
		multipartFiles.forEach((file) => transfer.items.add(file));
		fileInputRef.current.files = transfer.files;
	}, [multipartFiles, signed]);
	function createPreviewUrl(file) {
		if (!props.image) return;
		const url = URL.createObjectURL(file);
		previewUrlsRef.current.add(url);
		return url;
	}
	function revokePreviewUrl(item) {
		if (!item.url || !previewUrlsRef.current.has(item.url)) return;
		URL.revokeObjectURL(item.url);
		previewUrlsRef.current.delete(item.url);
	}
	async function signAndUpload(item, file) {
		const markFailed = () => {
			setItems((prev) => prev.map((entry) => entry.id === item.id ? {
				...entry,
				status: "error"
			} : entry));
		};
		const response = await requestSignedUpload(action, {
			ref: componentRef,
			target: uploadKey,
			filename: file.name,
			contentType: file.type,
			values
		});
		if (!response.ok) {
			markFailed();
			return;
		}
		const sign = await response.json();
		try {
			const put = await xhrTransfer({
				url: sign.url,
				method: sign.method.toUpperCase(),
				body: file,
				headers: sign.headers,
				onProgress: (progress) => setItems((prev) => prev.map((entry) => entry.id === item.id ? {
					...entry,
					progress
				} : entry))
			});
			setItems((prev) => prev.map((entry) => entry.id === item.id ? {
				...entry,
				status: put.ok ? "ready" : "error",
				key: sign.key,
				progress: 100
			} : entry));
		} catch {
			markFailed();
		}
	}
	function addFiles(fileList) {
		if (!fileList || locked) return;
		const incoming = Array.from(fileList);
		const next = incoming.map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			size: file.size,
			status: signed ? "uploading" : "ready",
			progress: 0,
			file,
			url: createPreviewUrl(file),
			existing: false
		}));
		if (!multiple) {
			items.forEach(revokePreviewUrl);
			if (!scope) {
				const replacedTokens = items.filter((item) => item.existing && item.token).map((item) => item.token);
				if (replacedTokens.length > 0) setRemovedTokens((tokens) => [...tokens, ...replacedTokens]);
			}
		}
		setItems((prev) => multiple ? [...prev, ...next] : next);
		if (signed) next.forEach((item, index) => void signAndUpload(item, incoming[index]));
	}
	function removeItem(id) {
		const target = items.find((item) => item.id === id);
		if (target) revokePreviewUrl(target);
		if (target?.existing && target.token && !scope) setRemovedTokens((tokens) => [...tokens, target.token]);
		setItems((prev) => prev.filter((i) => i.id !== id));
	}
	if (hidden) return null;
	return /* @__PURE__ */ jsx(FormFieldFrame, {
		error: errors[errorKey],
		helperText: props.helperText ?? void 0,
		tooltip: props.tooltip ?? void 0,
		label: props.label ?? "",
		id: inputId,
		required,
		children: (controlProps) => /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 rounded-lt-sm border border-dashed border-lt-border bg-lt-surface px-4 py-6",
			"data-test": testIdentity(name),
			onDragOver: (event) => event.preventDefault(),
			onDrop: (event) => {
				event.preventDefault();
				addFiles(event.dataTransfer.files);
			},
			children: [
				/* @__PURE__ */ jsx("button", {
					className: "text-sm text-lt-muted-fg",
					disabled: locked,
					onClick: () => fileInputRef.current?.click(),
					type: "button",
					children: t("form.file-upload.dropzone", "Drop files here or click to browse")
				}),
				/* @__PURE__ */ jsx("ul", {
					className: props.image ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "flex flex-col gap-2",
					children: items.map((item) => /* @__PURE__ */ jsxs("li", {
						className: props.image ? "flex min-w-0 items-center gap-3 rounded-lt-sm border border-lt-border bg-lt-bg p-2 text-sm" : "flex items-center justify-between gap-3 text-sm",
						children: [
							props.image && item.url ? /* @__PURE__ */ jsx("img", {
								alt: item.name,
								className: "size-16 shrink-0 rounded-lt-sm border border-lt-border object-cover",
								"data-test": testIdentity(`${name}-preview`),
								src: item.url
							}) : null,
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "block truncate",
										"data-test": testIdentity(`${name}-item`),
										children: item.name
									}),
									item.status === "uploading" && /* @__PURE__ */ jsxs("span", {
										className: "text-xs text-lt-muted-fg",
										children: [item.progress, "%"]
									}),
									item.status === "error" && /* @__PURE__ */ jsx("span", {
										className: "text-xs text-lt-danger",
										children: t("form.file-upload.failed", "Failed")
									})
								]
							}),
							(!item.existing || !scope) && /* @__PURE__ */ jsx(IconButton, {
								size: "sm",
								icon: "x",
								label: t("form.file-upload.remove", "Remove {{name}}", { name: item.name }),
								"data-test": testIdentity(item.existing ? `${name}-remove-existing` : `${name}-remove`),
								disabled: locked,
								onClick: () => removeItem(item.id)
							}),
							signed && !item.existing && item.key && item.status === "ready" && /* @__PURE__ */ jsx("input", {
								"data-test": testIdentity(`${name}-uploaded`),
								name: fieldName,
								type: "hidden",
								value: item.key
							})
						]
					}, item.id))
				}),
				!scope && removedTokens.map((token) => /* @__PURE__ */ jsx("input", {
					name: `${name}__removed[]`,
					type: "hidden",
					value: token
				}, token)),
				/* @__PURE__ */ jsx("input", {
					...controlProps,
					accept: props.accept ?? void 0,
					"aria-label": props.label ?? name,
					className: "sr-only",
					"data-test": testIdentity(`${name}-input`),
					multiple,
					name: signed ? void 0 : fieldName,
					onChange: (event) => {
						addFiles(event.target.files);
						if (signed) event.target.value = "";
					},
					ref: fileInputRef,
					type: "file"
				})
			]
		})
	});
};
//#endregion
export { FileUploadComponent };

//# sourceMappingURL=file-upload.js.map