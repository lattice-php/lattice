/**
 * Shared client transport for the lattice form endpoint. Every form sub-action
 * (validation resolve, option search) POSTs to the same signed form URL, so the
 * CSRF header, component-ref header, and request shape live here in one place.
 */

import { jsonPostHeaders, withHeaders, xsrfToken } from "@lattice-php/lattice/core/headers";
import { ROW_ID_KEY } from "./fields/repeater-rows";

export const FORM_DEBOUNCE_MS = 250;

export { xsrfToken };

function scrubFormPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(scrubFormPayload);
  }

  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (payload, [key, item]) => {
        if (key !== ROW_ID_KEY) {
          payload[key] = scrubFormPayload(item);
        }

        return payload;
      },
      {},
    );
  }

  return value;
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
    headers: withHeaders(componentRef, jsonPostHeaders("application/json")),
    body: JSON.stringify(scrubFormPayload(body)),
  }).then((response) => (response.ok ? (response.json() as Promise<T>) : null));
}
