import { createListeners } from "../lib/listeners.js";
import { useSyncExternalStore } from "react";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
//#region resources/js/i18n/locale.ts
var key = "locale";
var fallback = "en";
var maxAge = 31536e3;
var { subscribe, notify } = createListeners();
var active;
function normalize(value) {
	const next = value.trim();
	return next === "" ? fallback : next;
}
function storedValue() {
	if (typeof window === "undefined") return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}
function cookieValue() {
	if (typeof document === "undefined") return null;
	const item = document.cookie.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${key}=`));
	if (!item) return null;
	try {
		return decodeURIComponent(item.slice(7));
	} catch {
		return null;
	}
}
function documentValue() {
	if (typeof document === "undefined") return null;
	return document.documentElement.lang || null;
}
function detectedLocale() {
	return normalize(storedValue() ?? cookieValue() ?? documentValue() ?? fallback);
}
function persist(locale) {
	if (typeof document !== "undefined") {
		document.cookie = `${key}=${encodeURIComponent(locale)};path=/;max-age=${maxAge};SameSite=Lax`;
		document.documentElement.lang = locale;
	}
	if (typeof window !== "undefined") try {
		localStorage.setItem(key, locale);
	} catch {
		return;
	}
}
function snapshot() {
	active ??= detectedLocale();
	return active;
}
function dispatch(locale) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(LATTICE_EVENT.localeChange, { detail: { locale } }));
}
function currentLocale() {
	return snapshot();
}
function localeHeader() {
	return { "Accept-Language": currentLocale() };
}
function subscribeLocale(callback) {
	return subscribe(() => callback(currentLocale()));
}
function setLocale(locale) {
	const previous = currentLocale();
	const next = normalize(locale);
	active = next;
	persist(next);
	if (next === previous) return;
	notify();
	dispatch(next);
}
function useLocale() {
	return {
		locale: useSyncExternalStore(subscribe, snapshot, () => fallback),
		setLocale
	};
}
//#endregion
export { currentLocale, localeHeader, setLocale, subscribeLocale, useLocale };

//# sourceMappingURL=locale.js.map