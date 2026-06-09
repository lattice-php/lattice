/**
 * Shared client transport for the lattice form endpoint. Every form sub-action
 * (validation resolve, option search) POSTs to the same signed form URL, so the
 * URL building, CSRF header, and request shape live here in one place.
 */

export const FORM_DEBOUNCE_MS = 250;

export function xsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : "";
}

export function formActionUrl(action: string, componentRef: string): string {
  return componentRef ? `${action}?_lattice=${encodeURIComponent(componentRef)}` : action;
}

export function postFormAction<T>(
  action: string,
  componentRef: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<T | null> {
  return fetch(formActionUrl(action, componentRef), {
    method: "POST",
    credentials: "same-origin",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-XSRF-TOKEN": xsrfToken(),
    },
    body: JSON.stringify(body),
  }).then((response) => (response.ok ? (response.json() as Promise<T>) : null));
}
