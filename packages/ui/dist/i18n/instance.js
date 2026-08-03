import { useConfig } from "./config.js";
import { registerDateTimeFormatter } from "./date-time-formatter.js";
import { locale_exports } from "./locale.js";
import { useCallback, useSyncExternalStore } from "react";
import i18next from "i18next";
//#region resources/js/i18n/instance.ts
var DEFAULT_NAMESPACE = "lattice";
var i18n = i18next.createInstance();
var initialization;
var hold;
var revision = 0;
function subscribe(onStoreChange) {
	const listener = () => {
		revision += 1;
		onStoreChange();
	};
	i18n.on("initialized", listener);
	i18n.on("loaded", listener);
	i18n.on("languageChanged", listener);
	i18n.store?.on("added", listener);
	i18n.store?.on("removed", listener);
	return () => {
		i18n.off("initialized", listener);
		i18n.off("loaded", listener);
		i18n.off("languageChanged", listener);
		i18n.store?.off("added", listener);
		i18n.store?.off("removed", listener);
	};
}
function snapshot() {
	return revision;
}
/**
* Defer component-driven initialization until `until` settles — for shells
* that render before the i18n bootstrap has loaded (SSR hydration), where the
* first rendered `useT` would otherwise win the init race and lock the HTTP
* backend out. Configuring callers (those passing `extend` to {@link ensureI18n})
* bypass the hold; a failed bootstrap releases it, so init stays fail-open.
*/
function holdI18nInit(until) {
	const release = () => {
		hold = void 0;
	};
	const released = until.then(release, release);
	if (!initialization) hold = released;
}
/**
* Initialize the instance exactly once. The first caller wins — a rendered
* component (inline English, zero config) or `enableBackend()`, which registers
* its backend first because i18next can only wire a backend during `init`.
*/
function ensureI18n(extend) {
	if (!initialization && hold && !extend) return hold.then(() => ensureI18n());
	if (!initialization) {
		const base = {
			lng: (0, locale_exports.currentLocale)(),
			fallbackLng: "en",
			ns: [DEFAULT_NAMESPACE],
			defaultNS: DEFAULT_NAMESPACE,
			interpolation: { escapeValue: false }
		};
		initialization = i18n.init(extend ? extend(base) : base);
		registerDateTimeFormatter(i18n);
	}
	return initialization;
}
(0, locale_exports.subscribeLocale)((locale) => {
	ensureI18n().then(() => {
		if (i18n.language !== locale) i18n.changeLanguage(locale);
	});
});
/**
* Eagerly load the namespaces for the given locales so a later
* `changeLanguage` resolves them from the store instead of an HTTP round-trip,
* which would otherwise flash the fallback language on switch. The active
* locale is already loaded by {@link ensureI18n}, so it is skipped.
*/
async function preloadLanguages(locales) {
	const pending = locales.filter((locale) => locale !== (0, locale_exports.currentLocale)());
	if (pending.length === 0) return;
	await ensureI18n();
	await i18n.loadLanguages([...pending]);
}
function useT(namespace) {
	ensureI18n();
	useSyncExternalStore(subscribe, snapshot, snapshot);
	const { locales } = useConfig();
	const { locale, setLocale } = (0, locale_exports.useLocale)();
	return {
		t: useCallback((key, defaultValue = key, options = {}) => translate(namespace, key, defaultValue, options), [namespace]),
		i18n,
		locale,
		locales,
		ready: i18n.isInitialized,
		setLocale
	};
}
function translate(namespace, key, defaultValue, options) {
	ensureI18n();
	if (!i18n.isInitialized || !i18n.hasLoadedNamespace(namespace)) return i18n.t(key, defaultValue, {
		ns: namespace,
		...options,
		saveMissing: false
	});
	return i18n.t(key, defaultValue, {
		ns: namespace,
		...options
	});
}
//#endregion
export { DEFAULT_NAMESPACE, ensureI18n, holdI18nInit, i18n, preloadLanguages, translate, useT };

//# sourceMappingURL=instance.js.map