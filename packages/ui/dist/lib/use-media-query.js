import { useEffect, useState } from "react";
//#region resources/js/lib/use-media-query.ts
function matches(query, fallback) {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return fallback;
	return window.matchMedia(query).matches;
}
/**
* Track a CSS media query. `fallback` is the SSR / no-`matchMedia` value and the
* initial state before the effect subscribes.
*/
function useMediaQuery(query, fallback = false) {
	const [state, setState] = useState(() => matches(query, fallback));
	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
		const media = window.matchMedia(query);
		const update = () => setState(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, [query]);
	return state;
}
//#endregion
export { useMediaQuery };

//# sourceMappingURL=use-media-query.js.map