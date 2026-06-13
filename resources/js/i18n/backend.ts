import type { I18nConfig } from "@lattice-php/lattice/types/generated";
import HttpBackend from "i18next-http-backend";
import { ensureI18n, i18n } from "./instance";

/** The i18n settings the backend shares to the frontend (Inertia `lattice.i18n`). */
export type { I18nConfig };

/** laravel-i18next's namespaced routes; an app behind a custom prefix overrides them via {@link BackendOptions}. */
const DEFAULT_LOAD_PATH = "/locales/{{lng}}/{{ns}}.json";
const DEFAULT_ADD_PATH = "/locales/add/{{lng}}/{{ns}}";

export type BackendOptions = {
  /** i18next-http-backend load path. Defaults to laravel-i18next's namespaced route. */
  loadPath?: string;
  /** Path that receives keys reported by saveMissing. */
  addPath?: string;
  /** Report missing keys back to the backend (laravel-i18next persists them). */
  saveMissing?: boolean;
  /** Extra request headers, e.g. the CSRF token for the saveMissing POST. */
  customHeaders?: () => Record<string, string>;
};

/** Apply the i18n config shared from the backend; wires the HTTP backend only when `enabled`. */
export async function configureI18n(config: I18nConfig | undefined): Promise<void> {
  if (!config?.enabled) {
    await ensureI18n();

    return;
  }

  await enableBackend({ saveMissing: config.saveMissing });
}

/**
 * Load translations from a backend such as bambamboole/laravel-i18next,
 * overriding the renderer's inline English defaults. Call before the first
 * render. Importing this module is the opt-in: apps that never call it don't
 * bundle the HTTP backend.
 */
export async function enableBackend(options: BackendOptions = {}): Promise<void> {
  const {
    loadPath = DEFAULT_LOAD_PATH,
    addPath = DEFAULT_ADD_PATH,
    saveMissing = false,
    customHeaders,
  } = options;

  i18n.use(HttpBackend);

  await ensureI18n((base) => ({
    ...base,
    partialBundledLanguages: true,
    saveMissing,
    backend: { loadPath, addPath, customHeaders, withCredentials: true },
  }));
}
