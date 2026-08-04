import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePersistentState } from "@lattice-php/ui";
import { apiJson } from "@lattice-php/core/api";
//#region resources/js/tree-context.tsx
var ROOTS_KEY = "";
var TreeContext = createContext({
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
});
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
var TYPEAHEAD_IDLE_MS = 800;
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
//#endregion
export { ROOTS_KEY, TreeContext, useTreeContext, useTreeState };

//# sourceMappingURL=tree-context.js.map