import { apiFetch } from "./api.js";
//#region resources/js/upload.ts
/**
* XHR rather than fetch because only XHR reports upload progress. A transport
* failure leaves `status` at 0, which `new Response` rejects as out of range, so
* it is mapped to 500 — otherwise the promise never settles and the upload hangs.
*/
function xhrTransfer({ url, method, body, headers, onProgress }) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open(method, url, true);
		Object.entries(headers).forEach(([key, value]) => request.setRequestHeader(key, String(value)));
		request.upload.onprogress = (event) => {
			if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100));
		};
		request.onload = () => {
			try {
				resolve(new Response(request.responseText || null, { status: request.status || 500 }));
			} catch {
				reject(/* @__PURE__ */ new Error(`Upload to ${url} returned an unusable response`));
			}
		};
		request.onerror = () => reject(/* @__PURE__ */ new Error(`Upload to ${url} failed`));
		request.send(body);
	});
}
/**
* Asks the component for a signed upload. Form fields spread their live values
* in so the server-side schema walk can find the field inside repeater rows.
*/
function requestSignedUpload(endpoint, { ref, target, filename, contentType, values }) {
	return apiFetch(endpoint, {
		method: "POST",
		ref,
		body: JSON.stringify({
			...values,
			_sub: "upload",
			_target: target,
			filename,
			contentType
		}),
		throwOnError: false
	});
}
//#endregion
export { requestSignedUpload, xhrTransfer };

//# sourceMappingURL=upload.js.map