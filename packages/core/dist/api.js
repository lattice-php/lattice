import { withHeaders } from "./headers.js";
import { latestRef, storeRefreshedRef } from "@lattice-php/core/component-ref";
import { localeHeader } from "@lattice-php/core/i18n/locale";
//#region resources/js/api.ts
/**
* The single funnel for raw-fetch HTTP, so the cross-cutting header, credential,
* and error policy has one home and call sites only declare intent. Returns a
* Response (not parsed data) so one primitive serves JSON, the chat's streaming
* getReader(), and multipart alike. Not for the Inertia world (router/useHttp),
* which carries its own headers.
*/
var ApiError = class extends Error {
	response;
	constructor(response) {
		super(`HTTP ${response.status}`);
		this.response = response;
	}
};
/**
* Exported so the few transports that cannot go through apiFetch — an XHR that
* reports upload progress, for instance — still send the same CSRF header.
*/
function xsrfToken() {
	const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : "";
}
var tokenRefreshSkewMs = 1e4;
var remoteTokenCache = /* @__PURE__ */ new Map();
var pendingRemoteTokens = /* @__PURE__ */ new Map();
function defaultHeaders(method) {
	if (!(method !== void 0 && method !== "GET" && method !== "HEAD")) return { Accept: "application/json" };
	return {
		Accept: "application/json",
		"Content-Type": "application/json",
		"X-Requested-With": "XMLHttpRequest",
		"X-XSRF-TOKEN": xsrfToken()
	};
}
var refRefreshEndpoint = "/lattice/refs/refresh";
/**
* Boot paths call this with the server-minted URL so subdirectory installs
* refresh against the right path; the default covers root installs.
*/
function setRefRefreshEndpoint(url) {
	refRefreshEndpoint = url;
}
var pendingRefRefreshes = /* @__PURE__ */ new Map();
/**
* Trade an expired-but-authentic ref for a fresh one. Deduped per original ref
* so a burst of 403s from one component costs a single round-trip. The renewed
* token lands in the component-ref map, so every later request that resolves
* its ref through withHeaders picks it up — this is the transport-agnostic
* primitive both the fetch funnel below and the Inertia form retry build on.
*/
async function refreshRef(componentRef) {
	const pending = pendingRefRefreshes.get(componentRef);
	if (pending) return pending;
	const request = apiJson(refRefreshEndpoint, {
		method: "POST",
		body: JSON.stringify({ ref: latestRef(componentRef) })
	}).then((data) => {
		storeRefreshedRef(componentRef, data.ref);
		return data.ref;
	}).catch(() => null).finally(() => {
		pendingRefRefreshes.delete(componentRef);
	});
	pendingRefRefreshes.set(componentRef, request);
	return request;
}
async function apiFetch(url, init = {}) {
	const { ref = "", headers, throwOnError = true, method, ...rest } = init;
	const normalizedMethod = method?.toUpperCase();
	const request = () => fetch(url, {
		credentials: "same-origin",
		...rest,
		method: normalizedMethod,
		headers: withHeaders(ref, {
			...defaultHeaders(normalizedMethod),
			...headers
		})
	});
	let response = await request();
	if (ref !== "" && response.status === 403 && await refreshRef(ref) !== null) response = await request();
	if (throwOnError && !response.ok) throw new ApiError(response);
	return response;
}
async function apiJson(url, init) {
	return (await apiFetch(url, init)).json();
}
function remoteTokenKey(remote) {
	return [
		remote.source,
		remote.audience,
		[...remote.scopes].sort().join(" ")
	].join("");
}
function clearRemoteTokenCache() {
	remoteTokenCache.clear();
	pendingRemoteTokens.clear();
}
function invalidateRemoteToken(remote) {
	remoteTokenCache.delete(remoteTokenKey(remote));
}
async function remoteToken(remote) {
	const key = remoteTokenKey(remote);
	const cached = remoteTokenCache.get(key);
	if (cached && cached.expiresAt > Date.now() + tokenRefreshSkewMs) return cached.token;
	const pending = pendingRemoteTokens.get(key);
	if (pending) return pending;
	const request = apiJson(remote.tokenEndpoint, {
		method: "POST",
		ref: remote.ref,
		body: JSON.stringify({
			nodeId: remote.nodeId,
			nodeType: remote.nodeType,
			audience: remote.audience,
			scopes: remote.scopes
		})
	}).then((token) => {
		remoteTokenCache.set(key, {
			token,
			expiresAt: Date.now() + Math.max(0, token.expiresIn) * 1e3
		});
		return token;
	}).finally(() => {
		pendingRemoteTokens.delete(key);
	});
	pendingRemoteTokens.set(key, request);
	return request;
}
function isUnauthorized(response) {
	return response.status === 401 || response.status === 403;
}
async function fetchRemoteWithToken(url, init, token) {
	const { headers, ...rest } = init;
	return fetch(url, {
		...rest,
		credentials: "omit",
		headers: {
			Accept: "application/json",
			...localeHeader(),
			...headers,
			Authorization: `${token.tokenType} ${token.accessToken}`
		}
	});
}
async function remoteFetch(url, init) {
	const { remote, throwOnError = true, ...request } = init;
	let token = await remoteToken(remote);
	let response = await fetchRemoteWithToken(url, request, token);
	if (isUnauthorized(response)) {
		invalidateRemoteToken(remote);
		token = await remoteToken(remote);
		response = await fetchRemoteWithToken(url, request, token);
	}
	if (throwOnError && !response.ok) throw new ApiError(response);
	return response;
}
async function remoteJson(url, init) {
	return (await remoteFetch(url, init)).json();
}
//#endregion
export { ApiError, apiFetch, apiJson, clearRemoteTokenCache, invalidateRemoteToken, refreshRef, remoteFetch, remoteJson, remoteToken, setRefRefreshEndpoint, xsrfToken };

//# sourceMappingURL=api.js.map