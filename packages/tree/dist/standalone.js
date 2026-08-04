import { Renderer, lazyComponent, nodeIdentity } from "@lattice-php/lattice/runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { router } from "@lattice-php/lattice/runtime";
import { Icon, cn, usePersistentState, useT } from "@lattice-php/lattice/runtime";
import { apiJson } from "@lattice-php/lattice/runtime";
import { jsx, jsxs } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region resources/js/tree-context.tsx
function useTreeContext() {
	return useContext(TreeContext);
}
function parseExpanded(raw) {
	const parsed = JSON.parse(raw);
	if (!Array.isArray(parsed)) throw new Error("expected an array of ids");
	return new Set(parsed.filter((id) => typeof id === "string"));
}
function visibleOrder(registry) {
	return [...registry.values()].sort((a, b) => a.orderPath.localeCompare(b.orderPath));
}
function useTreeState({ activeId: initialActiveId, defaultExpanded, endpoint, componentRef, lazy, nodes, rememberState, storageKey }) {
	const [expanded, setExpanded] = usePersistentState(storageKey, () => new Set(defaultExpanded), {
		enabled: rememberState,
		parse: parseExpanded,
		serialize: (value) => JSON.stringify([...value])
	});
	const [activeId, setActiveId] = useState(initialActiveId);
	const [focusedId, setFocusedId] = useState(() => nodes[0]?.id ?? null);
	const registryRef = useRef(/* @__PURE__ */ new Map());
	const typeAheadRef = useRef({
		text: "",
		timestamp: 0
	});
	const [loaded, setLoaded] = useState(/* @__PURE__ */ new Map());
	const [loading, setLoading] = useState(/* @__PURE__ */ new Set());
	const inFlightRef = useRef(/* @__PURE__ */ new Set());
	const loadedRef = useRef(loaded);
	loadedRef.current = loaded;
	const canLoad = endpoint !== null && endpoint !== "";
	const toggle = useCallback((id) => {
		setExpanded((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, [setExpanded]);
	const activate = useCallback((id) => setActiveId(id), []);
	const focus = useCallback((id) => {
		setFocusedId(id);
		[...registryRef.current.values()].find((candidate) => candidate.id === id)?.ref.current?.focus();
	}, []);
	const register = useCallback((entry) => {
		registryRef.current.set(entry.path, entry);
	}, []);
	const unregister = useCallback((path) => {
		registryRef.current.delete(path);
	}, []);
	const moveFocus = useCallback((fromId, direction) => {
		const order = visibleOrder(registryRef.current);
		if (order.length === 0) return;
		const index = order.findIndex((entry) => entry.id === fromId);
		const current = index === -1 ? void 0 : order[index];
		let target;
		switch (direction) {
			case "next":
				target = index === -1 ? void 0 : order[index + 1];
				break;
			case "prev":
				target = index === -1 ? void 0 : order[index - 1];
				break;
			case "first":
				target = order[0];
				break;
			case "last":
				target = order[order.length - 1];
				break;
			case "parent":
				target = current ? order.find((entry) => entry.path === current.parentPath) : void 0;
				break;
			case "firstChild": target = current ? order.find((entry) => entry.parentPath === current.path) : void 0;
		}
		if (target) focus(target.id);
	}, [focus]);
	const typeAhead = useCallback((fromId, character) => {
		const order = visibleOrder(registryRef.current);
		if (order.length === 0) return;
		const now = Date.now();
		const buffer = typeAheadRef.current;
		const text = now - buffer.timestamp > TYPEAHEAD_IDLE_MS ? character : buffer.text + character;
		typeAheadRef.current = {
			text,
			timestamp: now
		};
		const needle = text.toLowerCase();
		const startIndex = order.findIndex((entry) => entry.id === fromId);
		const start = startIndex === -1 ? 0 : startIndex;
		for (let offset = 1; offset <= order.length; offset++) {
			const candidate = order[(start + offset) % order.length];
			if (candidate.label.toLowerCase().startsWith(needle)) {
				focus(candidate.id);
				return;
			}
		}
	}, [focus]);
	const loadChildren = useCallback((id) => {
		if (!canLoad || inFlightRef.current.has(id) || loadedRef.current.has(id)) return;
		inFlightRef.current.add(id);
		setLoading((current) => new Set(current).add(id));
		apiJson(`${endpoint}?parent=${encodeURIComponent(id)}`, { ref: componentRef ?? "" }).then(({ nodes: fetched }) => {
			setLoaded((current) => new Map(current).set(id, fetched));
		}).catch(() => {
			setExpanded((current) => {
				const next = new Set(current);
				next.delete(id);
				return next;
			});
		}).finally(() => {
			inFlightRef.current.delete(id);
			setLoading((current) => {
				const next = new Set(current);
				next.delete(id);
				return next;
			});
		});
	}, [
		canLoad,
		componentRef,
		endpoint,
		setExpanded
	]);
	const childrenFor = useCallback((id) => loaded.get(id), [loaded]);
	const isLoading = useCallback((id) => loading.has(id), [loading]);
	const hasWireNodes = nodes.length > 0;
	useEffect(() => {
		if (lazy && !hasWireNodes) loadChildren("");
	}, [
		lazy,
		hasWireNodes,
		loadChildren
	]);
	const firstFetchedRootId = loaded.get("")?.[0]?.id;
	useEffect(() => {
		if (focusedId === null && firstFetchedRootId !== void 0) setFocusedId(firstFetchedRootId);
	}, [focusedId, firstFetchedRootId]);
	return useMemo(() => ({
		activate,
		activeId,
		canLoad,
		childrenFor,
		expanded,
		focus,
		focusedId,
		isLoading,
		loadChildren,
		moveFocus,
		register,
		toggle,
		typeAhead,
		unregister
	}), [
		activate,
		activeId,
		canLoad,
		childrenFor,
		expanded,
		focus,
		focusedId,
		isLoading,
		loadChildren,
		moveFocus,
		register,
		toggle,
		typeAhead,
		unregister
	]);
}
var defaultTreeContext, TreeContext, TYPEAHEAD_IDLE_MS;
var init_tree_context = __esmMin((() => {
	defaultTreeContext = {
		activate: () => {},
		activeId: null,
		canLoad: false,
		childrenFor: () => void 0,
		expanded: /* @__PURE__ */ new Set(),
		focus: () => {},
		focusedId: null,
		isLoading: () => false,
		loadChildren: () => {},
		moveFocus: () => {},
		register: () => {},
		toggle: () => {},
		typeAhead: () => {},
		unregister: () => {}
	};
	TreeContext = createContext(defaultTreeContext);
	TYPEAHEAD_IDLE_MS = 800;
}));
//#endregion
//#region resources/js/tree.tsx
var tree_exports = /* @__PURE__ */ __exportAll({ default: () => TreeComponent });
function isExpandable(node, children, canLoad) {
	return Boolean(children?.length) || node.hasChildren === true && (canLoad || Boolean(node.children?.length));
}
function orderPathSegment(index) {
	return String(index).padStart(ORDER_PATH_SEGMENT_WIDTH, "0");
}
function TreeItem({ depth, node, orderPath, parentPath, siblingCount, siblingIndex }) {
	const { activate, activeId, canLoad, childrenFor, expanded, focusedId, isLoading, loadChildren, moveFocus, register, toggle, typeAhead, unregister } = useTreeContext();
	const { t } = useT("tree");
	const ref = useRef(null);
	const path = parentPath ? `${parentPath}/${node.id}` : node.id;
	const isExpanded = expanded.has(node.id);
	const isActive = activeId === node.id;
	const isFocused = focusedId === node.id;
	const isDisabled = node.disabled === true;
	const children = node.children ?? childrenFor(node.id);
	const expandable = isExpandable(node, children, canLoad);
	const loading = isLoading(node.id);
	const bodyRef = useRef(null);
	useEffect(() => {
		if (isExpanded && node.hasChildren === true && !node.children && !children) loadChildren(node.id);
	}, [
		isExpanded,
		node,
		children,
		loadChildren
	]);
	useEffect(() => {
		register({
			id: node.id,
			label: node.label,
			orderPath,
			parentPath,
			path,
			ref
		});
		return () => unregister(path);
	}, [
		node.id,
		node.label,
		orderPath,
		parentPath,
		path,
		register,
		unregister
	]);
	useEffect(() => {
		const container = bodyRef.current;
		if (!container) return;
		container.querySelectorAll("button, a[href], [tabindex]").forEach((control) => {
			control.tabIndex = -1;
		});
	}, [node.schema]);
	function onKeyDown(event) {
		if (event.target !== event.currentTarget) return;
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveFocus(node.id, "next");
				return;
			case "ArrowUp":
				event.preventDefault();
				moveFocus(node.id, "prev");
				return;
			case "ArrowRight":
				event.preventDefault();
				if (expandable && !isExpanded) toggle(node.id);
				else if (expandable) moveFocus(node.id, "firstChild");
				return;
			case "ArrowLeft":
				event.preventDefault();
				if (expandable && isExpanded) toggle(node.id);
				else moveFocus(node.id, "parent");
				return;
			case "Home":
				event.preventDefault();
				moveFocus(node.id, "first");
				return;
			case "End":
				event.preventDefault();
				moveFocus(node.id, "last");
				return;
			case "Enter":
			case " ":
				event.preventDefault();
				if (isDisabled) return;
				if (node.href) router.visit(node.href);
				else {
					const trigger = bodyRef.current?.querySelector("button");
					if (trigger) {
						trigger.click();
						ref.current?.focus();
					} else activate(node.id);
				}
				return;
			default: if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeAhead(node.id, event.key);
		}
	}
	return /* @__PURE__ */ jsxs("li", {
		"aria-disabled": isDisabled,
		"aria-expanded": expandable ? isExpanded : void 0,
		"aria-label": node.label,
		"aria-level": depth,
		"aria-posinset": siblingIndex,
		"aria-selected": isActive,
		"aria-setsize": siblingCount,
		"data-test": `tree-node-${node.id}`,
		onKeyDown,
		ref,
		role: "treeitem",
		tabIndex: isFocused ? 0 : -1,
		children: [/* @__PURE__ */ jsxs("div", {
			className: cn("flex items-center gap-2 rounded-lt-sm px-2 py-1.5 text-sm text-lt-fg", isActive && "bg-lt-muted font-medium", isDisabled && "pointer-events-none opacity-50"),
			children: [expandable ? /* @__PURE__ */ jsx("button", {
				"aria-label": isExpanded ? t("tree.collapse", "Collapse {{label}}", { label: node.label }) : t("tree.expand", "Expand {{label}}", { label: node.label }),
				"data-test": `tree-node-${node.id}-toggle`,
				onClick: () => toggle(node.id),
				tabIndex: -1,
				type: "button",
				children: loading ? /* @__PURE__ */ jsx(Icon, {
					className: "size-lt-icon-md shrink-0 animate-spin",
					name: "loader-2"
				}) : /* @__PURE__ */ jsx(Icon, {
					className: cn("size-lt-icon-md shrink-0 transition-transform", isExpanded && "rotate-90"),
					name: "chevron-right"
				})
			}) : null, /* @__PURE__ */ jsx("span", {
				className: "flex min-w-0 flex-1 items-center gap-2",
				ref: bodyRef,
				children: /* @__PURE__ */ jsx(Renderer, { nodes: node.schema })
			})]
		}), expandable && isExpanded && children && children.length > 0 ? /* @__PURE__ */ jsx("ul", {
			className: "pl-6",
			role: "group",
			children: children.map((child, index) => /* @__PURE__ */ jsx(TreeItem, {
				depth: depth + 1,
				node: child,
				orderPath: `${orderPath}.${orderPathSegment(index)}`,
				parentPath: path,
				siblingCount: children.length,
				siblingIndex: index + 1
			}, child.id))
		}) : null]
	});
}
var ORDER_PATH_SEGMENT_WIDTH, TreeComponent;
var init_tree = __esmMin((() => {
	init_tree_context();
	ORDER_PATH_SEGMENT_WIDTH = 6;
	TreeComponent = ({ node }) => {
		const identity = nodeIdentity(node);
		const value = useTreeState({
			activeId: node.props.activeId,
			defaultExpanded: node.props.defaultExpanded,
			endpoint: node.props.endpoint ?? null,
			componentRef: node.props.ref ?? null,
			lazy: node.props.lazy === true,
			nodes: node.props.nodes,
			rememberState: node.props.rememberState,
			storageKey: `lattice:tree:${identity ?? "default"}`
		});
		const roots = node.props.nodes.length > 0 ? node.props.nodes : value.childrenFor("") ?? [];
		return /* @__PURE__ */ jsx(TreeContext.Provider, {
			value,
			children: /* @__PURE__ */ jsx("ul", {
				"data-lattice-component": identity,
				role: "tree",
				children: roots.map((child, index) => /* @__PURE__ */ jsx(TreeItem, {
					depth: 1,
					node: child,
					orderPath: orderPathSegment(index),
					parentPath: null,
					siblingCount: roots.length,
					siblingIndex: index + 1
				}, child.id))
			})
		});
	};
}));
//#endregion
//#region resources/js/plugin.ts
var plugin_default = {
	name: "lattice/tree",
	components: { tree: lazyComponent(() => Promise.resolve().then(() => (init_tree(), tree_exports))) },
	i18n: { namespace: "tree" }
};
//#endregion
export { plugin_default as default };

//# sourceMappingURL=standalone.js.map