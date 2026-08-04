import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { router } from "@inertiajs/react";
import { useExtensionRegistry } from "@lattice-php/core/registry-context";
import { setLocale } from "@lattice-php/ui/i18n/locale";
//#region resources/js/effects/registry.ts
var EFFECT_HANDLER_REGISTRY_EXTENSION = "effects";
function useEffectHandlerRegistry() {
	return useExtensionRegistry(EFFECT_HANDLER_REGISTRY_EXTENSION);
}
/**
* Author a handler against `EffectHandler<"my.type">` for a typed payload, then
* register it through this — it erases the type parameter for the loose registry.
*/
function effectHandler(_type, fn) {
	return fn;
}
function triggerDownload(url) {
	const link = document.createElement("a");
	link.href = url;
	link.rel = "noopener";
	document.body.appendChild(link);
	link.click();
	link.remove();
}
function bridge(event) {
	return (effect) => window.dispatchEvent(new CustomEvent(event, { detail: effect.props }));
}
var builtinEffectHandlers = {
	"reload-page": (effect) => effect.props.full ? window.location.reload() : router.reload(),
	redirect: (effect) => router.visit(effect.props.url),
	download: (effect) => triggerDownload(effect.props.url),
	"locale-change": (effect) => setLocale(effect.props.locale),
	toast: bridge(LATTICE_EVENT.toast),
	callout: bridge(LATTICE_EVENT.callout),
	"retract-callout": bridge(LATTICE_EVENT.retractCallout),
	"reload-component": bridge(LATTICE_EVENT.reloadComponent),
	"open-modal": bridge(LATTICE_EVENT.openModal),
	"close-modal": bridge(LATTICE_EVENT.closeModal),
	"reset-form": bridge(LATTICE_EVENT.resetForm),
	"toggle-sidebar": bridge(LATTICE_EVENT.toggleSidebar)
};
function mergeEffectHandlers(...registries) {
	return Object.assign({}, ...registries);
}
//#endregion
export { EFFECT_HANDLER_REGISTRY_EXTENSION, builtinEffectHandlers, effectHandler, mergeEffectHandlers, useEffectHandlerRegistry };

//# sourceMappingURL=registry.js.map