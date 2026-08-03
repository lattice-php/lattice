import { createListeners } from "../lib/listeners.js";
import { useSyncExternalStore } from "react";
//#region resources/js/i18n/config.ts
var fallback = {
	locales: [],
	timezone: null
};
var { subscribe, notify } = createListeners();
var active = fallback;
function normalizeLocales(locales) {
	return Array.from(new Set((locales ?? []).map((locale) => locale.trim()).filter(Boolean)));
}
function snapshot() {
	return active;
}
var subscribeConfig = subscribe;
function setConfig(config) {
	const locales = normalizeLocales(config?.locales);
	const timezone = config?.timezone ?? null;
	if (active.locales.join("") === locales.join("") && active.timezone === timezone) return;
	active = {
		locales,
		timezone
	};
	notify();
}
function configTimezone() {
	return active.timezone;
}
function useConfig() {
	return useSyncExternalStore(subscribeConfig, snapshot, () => fallback);
}
//#endregion
export { configTimezone, setConfig, subscribeConfig, useConfig };

//# sourceMappingURL=config.js.map