import HttpBackend from "i18next-http-backend";
import { i18n } from "./instance";

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

/**
 * Load the `lattice` namespace from a backend such as
 * bambamboole/laravel-i18next, overriding the bundled English defaults. Call
 * once at app startup, before the first render. Importing this module is the
 * opt-in: apps that never call it don't bundle the HTTP backend.
 */
export async function enableBackend(options: BackendOptions = {}): Promise<void> {
  const {
    loadPath = "/locales/{{lng}}/{{ns}}.json",
    addPath = "/locales/add/{{lng}}/{{ns}}",
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
