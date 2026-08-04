import { useCallback, useEffect, useMemo, useRef } from "react";
//#region resources/js/lib/use-debounced-callback.ts
/**
* A debounced wrapper around `callback` that is stable across renders (it reads
* the latest callback via a ref) and clears its pending timer on unmount, so a
* late fire can never run against a torn-down component.
*/
function useDebouncedCallback(callback, delayMs) {
	const callbackRef = useRef(callback);
	callbackRef.current = callback;
	const timerRef = useRef(null);
	const cancel = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);
	useEffect(() => cancel, [cancel]);
	return useMemo(() => {
		const debounced = (...args) => {
			cancel();
			timerRef.current = setTimeout(() => {
				timerRef.current = null;
				callbackRef.current(...args);
			}, delayMs);
		};
		debounced.cancel = cancel;
		return debounced;
	}, [cancel, delayMs]);
}
//#endregion
export { useDebouncedCallback };

//# sourceMappingURL=use-debounced-callback.js.map