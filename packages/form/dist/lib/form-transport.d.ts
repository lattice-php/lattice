/**
 * Shared client transport for the lattice form endpoint: every form sub-action
 * (validation resolve, option search) POSTs to the same signed URL, so the
 * request shape lives here once.
 */
export declare const FORM_DEBOUNCE_MS = 250;
export declare function postFormAction<T>(action: string, componentRef: string, body: Record<string, unknown>, signal: AbortSignal): Promise<T | null>;
