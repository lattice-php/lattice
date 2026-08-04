import { useCallback, useRef, useState } from "react";
//#region resources/js/lib/use-persistent-state.ts
/**
* `useState` backed by `localStorage`. The SSR guard and read/write `try/catch`
* live here once; `parse`/`serialize` default to JSON. Persistence happens in
* the setter (not inside the state updater), so a StrictMode double-invoke never
* double-writes, and a `serialize` returning `null` removes the key.
*/
function usePersistentState(key, fallback, options = {}) {
	const { enabled = true, parse, serialize } = options;
	const resolveFallback = () => typeof fallback === "function" ? fallback() : fallback;
	const [value, setValue] = useState(() => {
		if (!enabled || typeof window === "undefined") return resolveFallback();
		let raw;
		try {
			raw = window.localStorage.getItem(key);
		} catch {
			return resolveFallback();
		}
		if (raw === null) return resolveFallback();
		try {
			return parse ? parse(raw) : JSON.parse(raw);
		} catch {
			try {
				window.localStorage.removeItem(key);
			} catch {
				return resolveFallback();
			}
			return resolveFallback();
		}
	});
	const valueRef = useRef(value);
	valueRef.current = value;
	const persistRef = useRef({
		enabled,
		key,
		serialize
	});
	persistRef.current = {
		enabled,
		key,
		serialize
	};
	return [value, useCallback((action) => {
		const next = typeof action === "function" ? action(valueRef.current) : action;
		valueRef.current = next;
		setValue(next);
		const { enabled: on, key: storageKey, serialize: encode } = persistRef.current;
		if (!on || typeof window === "undefined") return;
		try {
			const encoded = encode ? encode(next) : JSON.stringify(next);
			if (encoded === null) window.localStorage.removeItem(storageKey);
			else window.localStorage.setItem(storageKey, encoded);
		} catch {
			return;
		}
	}, [])];
}
//#endregion
export { usePersistentState };

//# sourceMappingURL=use-persistent-state.js.map