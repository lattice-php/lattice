import HttpBackend from "i18next-http-backend";
import { i18n } from "./instance";

/**
 * laravel-i18next's default routes (with `namespaces` enabled), in
 * i18next-http-backend placeholder form. `{{ns}}` is filled per request, so a
 * single pair of paths serves every namespace; an app behind a custom route
 * prefix can override them via {@link BackendOptions}.
 */
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

/** The i18n settings the backend shares to the frontend (Inertia `lattice.i18n`). */
export type I18nConfig = {
  enabled?: boolean;
  loadPath?: string;
  addPath?: string;
  saveMissing?: boolean;
};

/**
 * Apply the i18n config shared from the backend. When `enabled`, wires the HTTP
 * backend with the backend-provided endpoints; otherwise the renderer keeps its
 * inline English defaults. Call once at startup, e.g. from the Inertia setup
 * with the initial page's `lattice.i18n` prop.
 */
export async function configureI18n(config: I18nConfig | undefined): Promise<void> {
  if (!config?.enabled) {
    return;
  }

  await enableBackend({
    loadPath: config.loadPath,
    addPath: config.addPath,
    saveMissing: config.saveMissing,
  });
}

/**
 * Load the `lattice` namespace from a backend such as
 * bambamboole/laravel-i18next, overriding the inline English defaults. Call once
 * at app startup, before the first render. Importing this module is the opt-in:
 * apps that never call it don't bundle the HTTP backend.
 */
export async function enableBackend(options: BackendOptions = {}): Promise<void> {
  const {
    loadPath = DEFAULT_LOAD_PATH,
    addPath = DEFAULT_ADD_PATH,
    saveMissing = false,
    customHeaders,
  } = options;

  i18n.use(HttpBackend);

  await i18n.init({
    ...i18n.options,
    partialBundledLanguages: true,
    saveMissing,
    backend: { loadPath, addPath, customHeaders, withCredentials: true },
  });
}
