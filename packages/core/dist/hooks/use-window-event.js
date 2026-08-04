import { useEffect, useRef } from "react";
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
export { useWindowEvent };

//# sourceMappingURL=use-window-event.js.map