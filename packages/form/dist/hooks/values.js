import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { jsx } from "react/jsx-runtime";
import { getPath, setPath } from "@lattice-php/form/lib/form-path";
//#region resources/js/hooks/values.tsx
var emptyValues = {};
var emptySelectedValues = {};
var FormValuesStoreContext = createContext(null);
var SetFormValueContext = createContext(() => {});
function valuesEqual(a, b) {
	if (Object.is(a, b)) return true;
	if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
	if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => valuesEqual(value, b[index]));
	const aEntries = Object.entries(a);
	const bObject = b;
	return aEntries.length === Object.keys(bObject).length && aEntries.every(([key, value]) => valuesEqual(value, bObject[key]));
}
function normalizePath(path) {
	return path.split(".").filter((part) => part !== "").join(".");
}
function pathsOverlap(left, right) {
	return left === "" || right === "" || left === right || left.startsWith(`${right}.`) || right.startsWith(`${left}.`);
}
function createFormValuesStore(initial) {
	let initialValues = initial;
	let values = initial;
	const listeners = /* @__PURE__ */ new Set();
	const pathListeners = /* @__PURE__ */ new Map();
	const selectedCache = /* @__PURE__ */ new Map();
	const notify = (path) => {
		for (const listener of listeners) listener();
		const normalizedPath = normalizePath(path);
		for (const [subscribedPath, subscribedListeners] of pathListeners) {
			if (!pathsOverlap(subscribedPath, normalizedPath)) continue;
			for (const listener of subscribedListeners) listener();
		}
	};
	const updateValues = (next, path) => {
		if (Object.is(values, next)) return;
		values = next;
		selectedCache.clear();
		notify(path);
	};
	const subscribePath = (path, listener) => {
		const normalizedPath = normalizePath(path);
		const listenersForPath = pathListeners.get(normalizedPath) ?? /* @__PURE__ */ new Set();
		listenersForPath.add(listener);
		pathListeners.set(normalizedPath, listenersForPath);
		return () => {
			listenersForPath.delete(listener);
			if (listenersForPath.size === 0) pathListeners.delete(normalizedPath);
		};
	};
	return {
		getPathSnapshot: (path) => getPath(values, path),
		getPathsSnapshot: (paths) => {
			if (paths.length === 0) return emptySelectedValues;
			const normalizedPaths = paths.map(normalizePath);
			const key = JSON.stringify(paths);
			const selectedValues = normalizedPaths.map((path) => getPath(values, path));
			const cached = selectedCache.get(key);
			if (cached && cached.values.length === selectedValues.length && selectedValues.every((value, index) => Object.is(value, cached.values[index]))) return cached.snapshot;
			const snapshot = Object.fromEntries(paths.map((path, index) => [path, selectedValues[index]]));
			selectedCache.set(key, {
				snapshot,
				values: selectedValues
			});
			return snapshot;
		},
		getSnapshot: () => values,
		replaceInitial: (nextInitial) => {
			if (valuesEqual(initialValues, nextInitial)) return;
			initialValues = nextInitial;
			updateValues(nextInitial, "");
		},
		reset: (fields) => {
			if (fields === void 0) {
				updateValues(initialValues, "");
				return;
			}
			const next = fields.reduce((accumulated, field) => setPath(accumulated, field, getPath(initialValues, field)), values);
			updateValues(next, "");
		},
		setValue: (name, value) => {
			const previous = getPath(values, name);
			const next = typeof value === "function" ? value(previous) : value;
			if (Object.is(previous, next)) return;
			updateValues(setPath(values, name, next), name);
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		subscribePath,
		subscribePaths: (paths, listener) => {
			const unsubscribers = Array.from(new Set(paths.map(normalizePath))).map((path) => subscribePath(path, listener));
			return () => {
				for (const unsubscribe of unsubscribers) unsubscribe();
			};
		}
	};
}
var fallbackFormValuesStore = createFormValuesStore(emptyValues);
function FormValuesProvider({ initial, children }) {
	const storeRef = useRef(null);
	if (storeRef.current === null) storeRef.current = createFormValuesStore(initial);
	useEffect(() => {
		storeRef.current?.replaceInitial(initial);
	}, [initial]);
	return /* @__PURE__ */ jsx(FormValuesStoreContext.Provider, {
		value: storeRef.current,
		children: /* @__PURE__ */ jsx(SetFormValueContext.Provider, {
			value: storeRef.current.setValue,
			children
		})
	});
}
function useFormValuesStore() {
	return useContext(FormValuesStoreContext) ?? fallbackFormValuesStore;
}
function useFormValues() {
	const store = useFormValuesStore();
	return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
function useFormValue(name) {
	const store = useFormValuesStore();
	const subscribe = useCallback((listener) => store.subscribePath(name, listener), [name, store]);
	const getSnapshot = useCallback(() => store.getPathSnapshot(name), [name, store]);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function useFormValuesFor(paths) {
	const store = useFormValuesStore();
	const pathsKey = JSON.stringify(paths);
	const selectedPaths = useMemo(() => JSON.parse(pathsKey), [pathsKey]);
	const subscribe = useCallback((listener) => store.subscribePaths(selectedPaths, listener), [selectedPaths, store]);
	const getSnapshot = useCallback(() => store.getPathsSnapshot(selectedPaths), [selectedPaths, store]);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function useSetFormValue() {
	return useContext(SetFormValueContext);
}
/**
* Reset values to the store's initial snapshot — all of them, or just the
* given field paths. This is the reset that actually clears controlled
* fields; Inertia's own form reset only touches its internal data and the
* DOM, which store-driven inputs ignore.
*/
function useResetFormValues() {
	const store = useFormValuesStore();
	return useCallback((fields) => store.reset(fields), [store]);
}
//#endregion
export { FormValuesProvider, useFormValue, useFormValues, useFormValuesFor, useResetFormValues, useSetFormValue };

//# sourceMappingURL=values.js.map