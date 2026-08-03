import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { router } from "@inertiajs/react";
import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
//#region resources/js/i18n/locale-reload.tsx
function LocaleReload({ preserveScroll = true, preserveState = true }) {
	useWindowEvent(LATTICE_EVENT.localeChange, (event) => {
		const locale = event.detail?.locale;
		if (typeof locale === "string" && locale !== "") router.visit(window.location.href, {
			preserveScroll,
			preserveState
		});
	});
	return null;
}
//#endregion
export { LocaleReload };

//# sourceMappingURL=locale-reload.js.map