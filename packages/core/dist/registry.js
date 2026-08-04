import { isRecord } from "./materialize.js";
import { lazy } from "react";
//#region resources/js/registry.ts
var LEGACY_COLUMN_EXTENSION = "table.columns";
var LEGACY_EFFECT_EXTENSION = "effects";
function eagerComponent(component) {
	return {
		component,
		mode: "eager"
	};
}
function lazyComponent(load) {
	const erasedLoader = load;
	return {
		component: lazy(erasedLoader),
		load: erasedLoader,
		mode: "lazy"
	};
}
var importModule = (url) => import(
	/* @vite-ignore */
	url
);
function componentRegistryIsValid(registry) {
	return registry === void 0 || isRecord(registry) && Object.values(registry).every((entry) => isRecord(entry) && (entry.mode === "eager" && typeof entry.component === "function" || entry.mode === "lazy" && isRecord(entry.component) && typeof entry.load === "function"));
}
function functionRegistryIsValid(registry) {
	return registry === void 0 || isRecord(registry) && Object.values(registry).every((entry) => typeof entry === "function");
}
function extensionRegistriesAreValid(registries) {
	return registries === void 0 || isRecord(registries) && Object.values(registries).every((registry) => isRecord(registry) && functionRegistryIsValid(registry));
}
function pluginFromModule(module, url) {
	const plugin = isRecord(module) ? module.default : void 0;
	if (!isRecord(plugin) || typeof plugin.name !== "string" || plugin.name.trim() === "" || !componentRegistryIsValid(plugin.components) || !functionRegistryIsValid(plugin.columns) || !functionRegistryIsValid(plugin.effects) || !extensionRegistriesAreValid(plugin.extensions) || plugin.i18n !== void 0 && (!isRecord(plugin.i18n) || typeof plugin.i18n.namespace !== "string" || plugin.i18n.namespace.trim() === "")) throw new TypeError(`[lattice] Plugin module [${url}] must default export a Plugin object.`);
	return plugin;
}
function loadPluginModules(urls, load = importModule) {
	return Promise.all(urls.map(async (url) => pluginFromModule(await load(url), url)));
}
function mergeExtensions(...registries) {
	const merged = {};
	for (const registriesByName of registries) for (const [name, registry] of Object.entries(registriesByName ?? {})) merged[name] = {
		...merged[name],
		...registry
	};
	return merged;
}
function legacyExtensions(columns, effects) {
	return {
		[LEGACY_COLUMN_EXTENSION]: columns ?? {},
		[LEGACY_EFFECT_EXTENSION]: effects ?? {}
	};
}
function registryWithAliases(components, extensions) {
	return {
		components,
		columns: extensions[LEGACY_COLUMN_EXTENSION] ?? {},
		effects: extensions[LEGACY_EFFECT_EXTENSION] ?? {},
		extensions
	};
}
function createRegistry(...plugins) {
	return plugins.reduce((registry, plugin) => registryWithAliases({
		...registry.components,
		...plugin.components
	}, mergeExtensions(registry.extensions, legacyExtensions(plugin.columns, plugin.effects), plugin.extensions)), registryWithAliases({}, {}));
}
function extendRegistry(registry, ...plugins) {
	const merged = createRegistry(...plugins);
	return registryWithAliases({
		...registry.components,
		...merged.components
	}, mergeExtensions(legacyExtensions(registry.columns, registry.effects), registry.extensions, merged.extensions));
}
//#endregion
export { createRegistry, eagerComponent, extendRegistry, lazyComponent, loadPluginModules };

//# sourceMappingURL=registry.js.map