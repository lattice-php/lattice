import { listeners_exports } from "../lib/listeners.js";
import { configTimezone, subscribeConfig } from "./config.js";
import { useSyncExternalStore } from "react";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
//#region resources/js/i18n/timezone.ts
var fallback = "UTC";
var { subscribe, notify } = (0, listeners_exports.createListeners)();
var override;
function detectedTimezone() {
	if (typeof Intl === "undefined") return fallback;
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
	} catch {
		return fallback;
	}
}
function snapshot() {
	return override ?? configTimezone() ?? detectedTimezone();
}
subscribeConfig(() => notify());
function dispatch(timezone) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(LATTICE_EVENT.timezoneChange, { detail: { timezone } }));
}
function currentTimezone() {
	return snapshot();
}
function setTimezone(timezone) {
	const previous = currentTimezone();
	const next = timezone.trim();
	override = next === "" ? void 0 : next;
	if (currentTimezone() === previous) return;
	notify();
	dispatch(currentTimezone());
}
function useTimezone() {
	return {
		timezone: useSyncExternalStore(subscribe, snapshot, () => fallback),
		setTimezone
	};
}
//#endregion
export { currentTimezone, setTimezone, useTimezone };

//# sourceMappingURL=timezone.js.map