import {
  BrowserToken as GeneratedBrowserToken,
  RemoteAccess as GeneratedRemoteAccess,
} from "./generated.js";
export declare class ApiError extends Error {
  readonly response: Response;
  constructor(response: Response);
}
/**
 * Exported so the few transports that cannot go through apiFetch — an XHR that
 * reports upload progress, for instance — still send the same CSRF header.
 */
export declare function xsrfToken(): string;
export type ApiInit = Omit<RequestInit, "headers"> & {
  ref?: string;
  headers?: Record<string, string>;
  throwOnError?: boolean;
};
export type BrowserToken = GeneratedBrowserToken;
export type RemoteAccess = GeneratedRemoteAccess;
export type RemoteInit = Omit<RequestInit, "credentials" | "headers"> & {
  headers?: Record<string, string>;
  remote: RemoteAccess;
  throwOnError?: boolean;
};
/**
 * Boot paths call this with the server-minted URL so subdirectory installs
 * refresh against the right path; the default covers root installs.
 */
export declare function setRefRefreshEndpoint(url: string): void;
/**
 * Trade an expired-but-authentic ref for a fresh one. Deduped per original ref
 * so a burst of 403s from one component costs a single round-trip. The renewed
 * token lands in the component-ref map, so every later request that resolves
 * its ref through withHeaders picks it up — this is the transport-agnostic
 * primitive both the fetch funnel below and the Inertia form retry build on.
 */
export declare function refreshRef(componentRef: string): Promise<string | null>;
export declare function apiFetch(url: string, init?: ApiInit): Promise<Response>;
export declare function apiJson<T>(url: string, init?: ApiInit): Promise<T>;
export declare function clearRemoteTokenCache(): void;
export declare function invalidateRemoteToken(remote: RemoteAccess): void;
export declare function remoteToken(remote: RemoteAccess): Promise<BrowserToken>;
export declare function remoteFetch(url: string, init: RemoteInit): Promise<Response>;
export declare function remoteJson<T>(url: string, init: RemoteInit): Promise<T>;
