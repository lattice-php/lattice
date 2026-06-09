/**
 * Shared client transport for the lattice form endpoint. Every form sub-action
 * (validation resolve, option search) POSTs to the same signed form URL, so the
 * CSRF header, component-ref header, and request shape live here in one place.
 */

import { withRefHeader } from "@lattice/lattice/core/component-ref";

export const FORM_DEBOUNCE_MS = 250;

export function xsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : "";
}

export function postFormAction<T>(
  action: string,
  componentRef: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<T | null> {
  return fetch(action, {
    method: "POST",
    credentials: "same-origin",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-XSRF-TOKEN": xsrfToken(),
      ...withRefHeader(componentRef),
    },
    body: JSON.stringify(body),
  }).then((response) => (response.ok ? (response.json() as Promise<T>) : null));
}
