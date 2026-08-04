import { useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { runAction } from "@lattice-php/action/lib/run-action";
import { apiFetch, xsrfToken } from "@lattice-php/core/api";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { withHeaders } from "@lattice-php/core/headers";
import { requestSignedUpload, xhrTransfer } from "@lattice-php/core/upload";
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
//#endregion
export { useMediaUpload };

//# sourceMappingURL=use-media-upload.js.map