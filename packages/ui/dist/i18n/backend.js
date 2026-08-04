import { setConfig } from "./config.js";
import { localeHeader } from "./locale.js";
import { ensureI18n, i18n, preloadLanguages } from "./instance.js";
import HttpBackend from "i18next-http-backend";
//#region resources/js/i18n/backend.ts
/** laravel-i18next's namespaced routes; an app behind a custom prefix overrides them via {@link BackendOptions}. */
var DEFAULT_LOAD_PATH = "/locales/{{lng}}/{{ns}}.json";
var DEFAULT_ADD_PATH = "/locales/add/{{lng}}/{{ns}}";
/** Apply the i18n config shared from the backend; wires the HTTP backend only when `enabled`. */
async function configureI18n(config, options = {}) {
	setConfig(config);
	if (!config?.enabled) {
		await ensureI18n((base) => ({
			...base,
			ns: options.namespaces ?? base.ns
		}));
		return;
	}
	await enableBackend({
		saveMissing: config.saveMissing,
		namespaces: options.namespaces
	});
	preloadLanguages(config.preloadLocales);
}
/**
* Load translations from a backend such as bambamboole/laravel-i18next,
* overriding the renderer's inline English defaults. Call before the first
* render. Importing this module is the opt-in: apps that never call it don't
* bundle the HTTP backend.
*/
async function enableBackend(options = {}) {
	const { namespaces, loadPath = DEFAULT_LOAD_PATH, addPath = DEFAULT_ADD_PATH, saveMissing = false, customHeaders } = options;
	const customHeadersWithLocale = () => ({
		...localeHeader(),
		...customHeaders?.()
	});
	i18n.use(HttpBackend);
	await ensureI18n((base) => ({
		...base,
		ns: namespaces ?? base.ns,
		partialBundledLanguages: true,
		saveMissing,
		backend: {
			loadPath,
			addPath,
			customHeaders: customHeadersWithLocale,
			withCredentials: true
		}
	}));
}
//#endregion
export { configureI18n, enableBackend };

//# sourceMappingURL=backend.js.map