import { createContext, useContext } from "react";
//#region resources/js/registry-context.tsx
/**
* Holds the active Registry for the current Provider subtree. Extracted into
* its own module to break the circular reference between provider.tsx (which
* imports the default registry instance) and use-effect-dispatcher.ts (which
* imports the context selector). Neither file imports from the other; both
* import from here.
*
* The context default is null. Selectors fall back to `_defaultRegistry`,
* which provider.tsx sets at module evaluation time (after registry.ts has
* finished loading). This avoids a synchronous evaluation cycle while
* preserving the pre-existing behaviour that components work without a
* surrounding <Provider>.
*/
var RegistryContext = createContext(null);
/**
* Called by provider.tsx at module-evaluation time, after registry.ts finishes
* loading. The constraint is on CALLING this setter, not on importing this
* module: do not call setDefaultRegistry from any module that evaluates before
* registry.ts completes. (use-effect-dispatcher.ts safely imports the selectors
* below — that import is exactly why this module was extracted.)
*/
var _defaultRegistry = null;
function setDefaultRegistry(registry) {
	_defaultRegistry = registry;
}
function useComponentRegistry() {
	return (useContext(RegistryContext) ?? _defaultRegistry)?.components ?? {};
}
function useExtensionRegistry(name) {
	return (useContext(RegistryContext) ?? _defaultRegistry)?.extensions[name] ?? {};
}
//#endregion
export { RegistryContext, setDefaultRegistry, useComponentRegistry, useExtensionRegistry };

//# sourceMappingURL=registry-context.js.map