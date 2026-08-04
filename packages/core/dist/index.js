import { Suspense, createContext, lazy, memo, useContext, useEffect, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/collapsed-context.ts
var CollapsedContext = createContext(false);
function useCollapsed() {
	return useContext(CollapsedContext);
}
//#endregion
//#region resources/js/component-ref.ts
/**
* The signed component reference travels to the server as the `X-Lattice-Ref`
* request header on every interactive request (GET and writes alike). This must
* match ComponentReferenceSigner::token() on the PHP side, which reads the same
* header.
*/
var LATTICE_REF_HEADER = "X-Lattice-Ref";
/**
* Refs are sealed with a lifetime and baked into node props at render time, so
* a long-lived tab cannot pick up a renewed token through React state. Renewed
* tokens are instead kept here, keyed by the original prop value, and resolved
* whenever a ref travels — every consumer keeps passing the ref it was rendered
* with.
*/
var refreshedRefs = /* @__PURE__ */ new Map();
function latestRef(componentRef) {
	return refreshedRefs.get(componentRef) ?? componentRef;
}
function storeRefreshedRef(componentRef, refreshed) {
	refreshedRefs.set(componentRef, refreshed);
}
function clearRefreshedRefs() {
	refreshedRefs.clear();
}
function withRefHeader(componentRef) {
	const ref = latestRef(componentRef);
	return ref ? { [LATTICE_REF_HEADER]: ref } : {};
}
//#endregion
//#region resources/js/event-names.ts
/**
* Single source of truth for the `lattice:*` DOM events the runtime dispatches
* and listens for. The built-in effect handlers in effects/registry.ts bridge
* effects to these events; the rest are framework events with no PHP counterpart.
*/
var LATTICE_EVENT = {
	callout: "lattice:callout",
	retractCallout: "lattice:retract-callout",
	toast: "lattice:toast",
	reloadComponent: "lattice:reload-component",
	openModal: "lattice:open-modal",
	closeModal: "lattice:close-modal",
	resetForm: "lattice:reset-form",
	toggleSidebar: "lattice:toggle-sidebar",
	appearanceChange: "lattice:appearance-change",
	localeChange: "lattice:locale-change",
	timezoneChange: "lattice:timezone-change",
	actionError: "lattice:action-error"
};
//#endregion
//#region resources/js/materialize.ts
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function dataBindings(value) {
	if (!isRecord(value)) return {};
	return Object.fromEntries(Object.entries(value).filter((entry) => {
		return typeof entry[1] === "string";
	}));
}
function rowValue(row, key) {
	if (key in row) return row[key];
	return key.split(".").reduce((value, segment) => {
		return isRecord(value) ? value[segment] : void 0;
	}, row);
}
function materializeProps(props, row) {
	if (!isRecord(props)) return {};
	const { dataBindings: bindings, ...materialized } = props;
	for (const [prop, key] of Object.entries(dataBindings(bindings))) {
		const value = rowValue(row, key);
		if (value !== void 0) materialized[prop] = value;
	}
	return materialized;
}
function materializeNode(node, row) {
	return {
		...node,
		props: materializeProps(node.props, row),
		schema: node.schema?.map((child) => materializeNode(child, row))
	};
}
function materializeSchema(schema, row) {
	return schema?.map((node) => materializeNode(node, row)) ?? [];
}
//#endregion
//#region resources/js/nodes.ts
/**
* Keep only the well-formed component nodes from an untyped value, dropping
* anything that isn't an object carrying a string `type`.
*/
function toNodes(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((node) => typeof node === "object" && node !== null && "type" in node && typeof node.type === "string");
}
/**
* Stable list key for a node: the reconciliation key, then the id, then a
* type-scoped index fallback so keyless template children never collide.
*/
function nodeKey(node, index) {
	return node.key ?? node.id ?? `${node.type}-${index}`;
}
//#endregion
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
	const registry = useContext(RegistryContext) ?? _defaultRegistry;
	const legacyColumns = name === "table.columns" ? registry?.columns : void 0;
	const legacyEffects = name === "effects" ? registry?.effects : void 0;
	return registry?.extensions?.[name] ?? legacyColumns ?? legacyEffects ?? {};
}
function useColumnRegistry() {
	return useExtensionRegistry("table.columns");
}
function useEffectHandlerRegistry() {
	return useExtensionRegistry("effects");
}
//#endregion
//#region resources/js/renderer.tsx
function MissingComponentIcon() {
	return /* @__PURE__ */ jsxs("svg", {
		"aria-hidden": "true",
		className: "size-lt-icon-md shrink-0",
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeWidth: "2",
		viewBox: "0 0 24 24",
		children: [
			/* @__PURE__ */ jsx("rect", {
				height: "18",
				rx: "2",
				strokeDasharray: "4 3",
				width: "18",
				x: "3",
				y: "3"
			}),
			/* @__PURE__ */ jsx("path", { d: "M12 8v4" }),
			/* @__PURE__ */ jsx("path", { d: "M12 16h.01" })
		]
	});
}
/**
* Fallback for a node whose type has no registered renderer. Always renders a
* visible, muted marker — icon-only survives tight spots like table cells — so
* the gap is never invisible. Shows the type inline in development; keeps it
* screen-reader-only (plus a hover tooltip) in production.
*/
function MissingComponent({ node }) {
	node.type;
	const label = `Missing component: ${node.type}`;
	return /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center gap-1.5 align-middle text-lt-muted-fg",
		"data-lattice-missing-component": node.type,
		title: label,
		children: [/* @__PURE__ */ jsx(MissingComponentIcon, {}), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: label
		})]
	});
}
function Renderer({ nodes }) {
	return nodes.map((node, index) => /* @__PURE__ */ jsx(NodeRenderer, { node }, nodeKey(node, index)));
}
function RenderNode({ node }) {
	return /* @__PURE__ */ jsx(NodeRenderer, { node });
}
var NodeRenderer = memo(function NodeRenderer({ node }) {
	const collapsed = useCollapsed();
	const registration = useComponentRegistry()[node.type];
	if (collapsed && node.props?.hideWhenCollapsed === true) return null;
	if (!registration) return /* @__PURE__ */ jsx(MissingComponent, { node });
	const Component = registration.component;
	const children = node.schema?.length ? /* @__PURE__ */ jsx(Renderer, { nodes: node.schema }) : null;
	const renderedComponent = /* @__PURE__ */ jsx(Component, {
		node,
		children
	});
	if (registration.mode === "lazy") return /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: renderedComponent
	});
	return renderedComponent;
});
//#endregion
//#region resources/js/test-id.ts
function testIdentity(value) {
	return value === void 0 || value === null || value === "" ? void 0 : value;
}
function nodeIdentity(node) {
	return testIdentity(node.key) ?? testIdentity(node.id);
}
function leafTestIdentity(value) {
	return testIdentity(value)?.split(".").at(-1);
}
function prefixedTestId(prefix, value) {
	const identity = leafTestIdentity(value);
	return identity ? `${prefix}-${identity}` : void 0;
}
function prefixedNodeTestId(prefix, node) {
	return prefixedTestId(prefix, nodeIdentity(node));
}
//#endregion
//#region resources/js/hooks/use-window-event.ts
/**
* Subscribe to a window event for the lifetime of the component. The handler is
* read through a ref, so a fresh handler each render never re-subscribes; pass
* `enabled: false` to detach without unmounting.
*/
function useWindowEvent(type, handler, options = {}) {
	const { enabled = true } = options;
	const handlerRef = useRef(handler);
	handlerRef.current = handler;
	useEffect(() => {
		if (!enabled || typeof window === "undefined") return;
		const listener = (event) => handlerRef.current(event);
		window.addEventListener(type, listener);
		return () => window.removeEventListener(type, listener);
	}, [type, enabled]);
}
//#endregion
export { CollapsedContext, LATTICE_EVENT, LATTICE_REF_HEADER, RegistryContext, RenderNode, Renderer, clearRefreshedRefs, createRegistry, dataBindings, eagerComponent, extendRegistry, isRecord, latestRef, lazyComponent, leafTestIdentity, loadPluginModules, materializeNode, materializeProps, materializeSchema, nodeIdentity, nodeKey, prefixedNodeTestId, prefixedTestId, rowValue, setDefaultRegistry, storeRefreshedRef, testIdentity, toNodes, useCollapsed, useColumnRegistry, useComponentRegistry, useEffectHandlerRegistry, useExtensionRegistry, useWindowEvent, withRefHeader };

//# sourceMappingURL=index.js.map