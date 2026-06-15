/**
 * Shared client transport for the lattice form endpoint: every form sub-action
 * (validation resolve, option search) POSTs to the same signed URL, so the
 * request shape — notably stripping client-only row ids — lives here once.
 */

import { apiFetch } from "@lattice-php/lattice/core/api";
import { ROW_ID_KEY } from "./fields/repeater-rows";

export const FORM_DEBOUNCE_MS = 250;

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
  return apiFetch(action, {
    method: "POST",
    ref: componentRef,
    signal,
    body: JSON.stringify(scrubFormPayload(body)),
    throwOnError: false,
  }).then((response) => (response.ok ? (response.json() as Promise<T>) : null));
}
