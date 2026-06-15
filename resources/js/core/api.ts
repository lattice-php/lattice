/**
 * The single funnel for raw-fetch HTTP, so the cross-cutting header, credential,
 * and error policy has one home and call sites only declare intent. Returns a
 * Response (not parsed data) so one primitive serves JSON, the chat's streaming
 * getReader(), and multipart alike. Not for the Inertia world (router/useHttp),
 * which carries its own headers.
 */

import { withHeaders } from "./headers";

export class ApiError extends Error {
  constructor(readonly response: Response) {
    super(`HTTP ${response.status}`);
  }
}

function xsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : "";
}

export type ApiInit = Omit<RequestInit, "headers"> & {
  ref?: string;
  headers?: Record<string, string>;
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
  // Some servers reject a lower-case method line, and fetch only normalizes the
  // standard verbs, so upper-case it here.
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
