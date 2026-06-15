/**
 * The single funnel for raw-fetch HTTP in the package. Callers pass a URL plus
 * overrides; this owns the cross-cutting header policy so call sites only
 * declare intent. It always sends same-origin credentials, defaults the Accept
 * (and, for write methods, the Content-Type) to JSON, adds the AJAX marker and
 * CSRF token to writes, composes the locale + component-ref headers (via
 * withHeaders), and throws on a failed response unless opted out.
 *
 * Returning a Response keeps one primitive serving JSON, the chat's streaming
 * getReader(), and multipart uniformly. Any default header can be overridden
 * through `headers` (e.g. a non-JSON Accept, or a body the browser must type).
 * Leave the Inertia world (router/useHttp) alone — this is for raw-data fetches.
 */

import { withHeaders, xsrfToken } from "./headers";

export class ApiError extends Error {
  constructor(readonly response: Response) {
    super(`HTTP ${response.status}`);
  }
}

export type ApiInit = Omit<RequestInit, "headers"> & {
  /** Sent as the X-Lattice-Ref header; the locale header is always added. */
  ref?: string;
  /** Merged over the defaulted headers, so callers can override any of them. */
  headers?: Record<string, string>;
  /** Throw an ApiError on a non-ok response. Defaults to true. */
  throwOnError?: boolean;
};

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

export async function apiFetch(url: string, init: ApiInit = {}): Promise<Response> {
  const { ref, headers, throwOnError = true, method, ...rest } = init;
  // fetch only upper-cases the standardized verbs, leaving PATCH/DELETE as given;
  // some servers reject a lower-case method line, so normalize it here.
  const normalizedMethod = method?.toUpperCase();
  const response = await fetch(url, {
    credentials: "same-origin",
    ...rest,
    method: normalizedMethod,
    headers: withHeaders(ref ?? "", { ...defaultHeaders(normalizedMethod), ...headers }),
  });

  if (throwOnError && !response.ok) {
    throw new ApiError(response);
  }

  return response;
}

export async function apiJson<T>(url: string, init?: ApiInit): Promise<T> {
  return (await apiFetch(url, init)).json() as Promise<T>;
}
