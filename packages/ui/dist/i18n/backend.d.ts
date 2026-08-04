import { I18nConfig } from '../types.js';
/** The i18n settings the backend shares to the frontend (Inertia `lattice.i18n`). */
export type { I18nConfig };
export type BackendOptions = {
    namespaces?: string[];
    /** i18next-http-backend load path. Defaults to laravel-i18next's namespaced route. */
    loadPath?: string;
    /** Path that receives keys reported by saveMissing. */
    addPath?: string;
    /** Report missing keys back to the backend (laravel-i18next persists them). */
    saveMissing?: boolean;
    /** Extra request headers, e.g. the CSRF token for the saveMissing POST. */
    customHeaders?: () => Record<string, string>;
};
export type ConfigureI18nOptions = {
    namespaces?: string[];
};
/** Apply the i18n config shared from the backend; wires the HTTP backend only when `enabled`. */
export declare function configureI18n(config: I18nConfig | undefined, options?: ConfigureI18nOptions): Promise<void>;
/**
 * Load translations from a backend such as bambamboole/laravel-i18next,
 * overriding the renderer's inline English defaults. Call before the first
 * render. Importing this module is the opt-in: apps that never call it don't
 * bundle the HTTP backend.
 */
export declare function enableBackend(options?: BackendOptions): Promise<void>;
