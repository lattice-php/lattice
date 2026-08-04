/**
 * The single funnel for raw-fetch HTTP, so the cross-cutting header, credential,
 * and error policy has one home and call sites only declare intent. Returns a
 * Response (not parsed data) so one primitive serves JSON, the chat's streaming
 * getReader(), and multipart alike. Not for the Inertia world (router/useHttp),
 * which carries its own headers.
 */

import { latestRef, storeRefreshedRef } from "@lattice-php/core/component-ref";
import { withHeaders, withRequestHeaders } from "./headers";

export class ApiError extends Error {
  constructor(readonly response: Response) {
    super(`HTTP ${response.status}`);
  }
}

/**
 * Exported so the few transports that cannot go through apiFetch — an XHR that
 * reports upload progress, for instance — still send the same CSRF header.
 */
export function xsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : "";
}

export type ApiInit = Omit<RequestInit, "headers"> & {
  ref?: string;
  headers?: Record<string, string>;
  throwOnError?: boolean;
};

export type BrowserToken = {
  readonly accessToken: string;
  readonly audience: string;
  readonly expiresIn: number;
  readonly scopes: string[];
  readonly tokenType: string;
};

export type RemoteAccess = {
  readonly audience: string;
  readonly nodeId: string;
  readonly nodeType: string;
  readonly ref: string;
  readonly scopes: string[];
  readonly source: string;
  readonly tokenEndpoint: string;
};

export type RemoteInit = Omit<RequestInit, "credentials" | "headers"> & {
  headers?: Record<string, string>;
  remote: RemoteAccess;
  throwOnError?: boolean;
};

type CachedBrowserToken = {
  expiresAt: number;
  token: BrowserToken;
};

const tokenRefreshSkewMs = 10_000;
const remoteTokenCache = new Map<string, CachedBrowserToken>();
const pendingRemoteTokens = new Map<string, Promise<BrowserToken>>();

function defaultHeaders(method: string | undefined): Record<string, string> {
  const isWrite = method !== undefined && method !== "GET" && method !== "HEAD";

  if (!isWrite) {
    return { Accept: "application/json" };
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-XSRF-TOKEN": xsrfToken(),
  };
}

let refRefreshEndpoint = "/lattice/refs/refresh";

/**
 * Boot paths call this with the server-minted URL so subdirectory installs
 * refresh against the right path; the default covers root installs.
 */
export function setRefRefreshEndpoint(url: string): void {
  refRefreshEndpoint = url;
}

const pendingRefRefreshes = new Map<string, Promise<string | null>>();

/**
 * Trade an expired-but-authentic ref for a fresh one. Deduped per original ref
 * so a burst of 403s from one component costs a single round-trip. The renewed
 * token lands in the component-ref map, so every later request that resolves
 * its ref through withHeaders picks it up — this is the transport-agnostic
 * primitive both the fetch funnel below and the Inertia form retry build on.
 */
export async function refreshRef(componentRef: string): Promise<string | null> {
  const pending = pendingRefRefreshes.get(componentRef);

  if (pending) {
    return pending;
  }

  const request = apiJson<{ ref: string }>(refRefreshEndpoint, {
    method: "POST",
    body: JSON.stringify({ ref: latestRef(componentRef) }),
  })
    .then((data) => {
      storeRefreshedRef(componentRef, data.ref);

      return data.ref;
    })
    .catch(() => null)
    .finally(() => {
      pendingRefRefreshes.delete(componentRef);
    });

  pendingRefRefreshes.set(componentRef, request);

  return request;
}

export async function apiFetch(url: string, init: ApiInit = {}): Promise<Response> {
  const { ref = "", headers, throwOnError = true, method, ...rest } = init;
  // Some servers reject a lower-case method line, and fetch only normalizes the
  // standard verbs, so upper-case it here.
  const normalizedMethod = method?.toUpperCase();
  const request = () =>
    fetch(url, {
      credentials: "same-origin",
      ...rest,
      method: normalizedMethod,
      // withHeaders resolves the latest refreshed token for the ref, so the
      // retry below picks up the renewal without threading it through.
      headers: withHeaders(ref, { ...defaultHeaders(normalizedMethod), ...headers }),
    });

  let response = await request();

  if (ref !== "" && response.status === 403 && (await refreshRef(ref)) !== null) {
    response = await request();
  }

  if (throwOnError && !response.ok) {
    throw new ApiError(response);
  }

  return response;
}

export async function apiJson<T>(url: string, init?: ApiInit): Promise<T> {
  return (await apiFetch(url, init)).json() as Promise<T>;
}

function remoteTokenKey(remote: RemoteAccess): string {
  return [remote.source, remote.audience, [...remote.scopes].sort().join(" ")].join("\u001f");
}

export function clearRemoteTokenCache(): void {
  remoteTokenCache.clear();
  pendingRemoteTokens.clear();
}

export function invalidateRemoteToken(remote: RemoteAccess): void {
  remoteTokenCache.delete(remoteTokenKey(remote));
}

export async function remoteToken(remote: RemoteAccess): Promise<BrowserToken> {
  const key = remoteTokenKey(remote);
  const cached = remoteTokenCache.get(key);

  if (cached && cached.expiresAt > Date.now() + tokenRefreshSkewMs) {
    return cached.token;
  }

  const pending = pendingRemoteTokens.get(key);

  if (pending) {
    return pending;
  }

  const request = apiJson<BrowserToken>(remote.tokenEndpoint, {
    method: "POST",
    ref: remote.ref,
    body: JSON.stringify({
      nodeId: remote.nodeId,
      nodeType: remote.nodeType,
      audience: remote.audience,
      scopes: remote.scopes,
    }),
  })
    .then((token) => {
      remoteTokenCache.set(key, {
        token,
        expiresAt: Date.now() + Math.max(0, token.expiresIn) * 1000,
      });

      return token;
    })
    .finally(() => {
      pendingRemoteTokens.delete(key);
    });

  pendingRemoteTokens.set(key, request);

  return request;
}

function isUnauthorized(response: Response): boolean {
  return response.status === 401 || response.status === 403;
}

async function fetchRemoteWithToken(
  url: string,
  init: Omit<RemoteInit, "remote" | "throwOnError">,
  token: BrowserToken,
): Promise<Response> {
  const { headers, ...rest } = init;

  return fetch(url, {
    ...rest,
    credentials: "omit",
    headers: withRequestHeaders({
      Accept: "application/json",
      ...headers,
      Authorization: `${token.tokenType} ${token.accessToken}`,
    }),
  });
}

export async function remoteFetch(url: string, init: RemoteInit): Promise<Response> {
  const { remote, throwOnError = true, ...request } = init;
  let token = await remoteToken(remote);
  let response = await fetchRemoteWithToken(url, request, token);

  if (isUnauthorized(response)) {
    invalidateRemoteToken(remote);
    token = await remoteToken(remote);
    response = await fetchRemoteWithToken(url, request, token);
  }

  if (throwOnError && !response.ok) {
    throw new ApiError(response);
  }

  return response;
}

export async function remoteJson<T>(url: string, init: RemoteInit): Promise<T> {
  return (await remoteFetch(url, init)).json() as Promise<T>;
}
