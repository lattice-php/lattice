/**
 * Shared client transport for the lattice form endpoint: every form sub-action
 * (validation resolve, option search) POSTs to the same signed URL, so the
 * request shape lives here once.
 */

import { apiFetch } from "@lattice-php/lattice/core/api";

export const FORM_DEBOUNCE_MS = 250;

export function postFormAction<T>(
  action: string,
  componentRef: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<T | null> {
  return apiFetch(action, {
    method: "POST",
    ref: componentRef,
    signal,
    body: JSON.stringify(body),
    throwOnError: false,
  }).then((response) => (response.ok ? (response.json() as Promise<T>) : null));
}
