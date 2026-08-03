import { useCallback, useRef } from "react";
import { useLayoutEffect } from "@lattice-php/ui/lib/use-layout-effect";
//#region resources/js/components/fields/use-flip-reorder.ts
var DURATION_MS = 180;
function prefersReducedMotion() {
	return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/**
* FLIP reorder: animates registered elements from their previous to current
* position whenever `orderSignature` changes. Imperative style writes only, so
* it does not affect React render or the memoised rows.
*/
function useFlipReorder(orderSignature) {
	const elements = useRef(/* @__PURE__ */ new Map());
	const previous = useRef(/* @__PURE__ */ new Map());
	const register = useCallback((key, el) => {
		if (el) elements.current.set(key, el);
		else elements.current.delete(key);
	}, []);
	useLayoutEffect(() => {
		const handles = [];
		const next = /* @__PURE__ */ new Map();
		elements.current.forEach((el, key) => {
			el.style.transition = "";
			el.style.transform = "";
			next.set(key, el.getBoundingClientRect());
		});
		if (!prefersReducedMotion()) elements.current.forEach((el, key) => {
			const before = previous.current.get(key);
			const after = next.get(key);
			if (before && after) {
				const dy = before.top - after.top;
				if (dy) {
					el.style.transform = `translateY(${dy}px)`;
					handles.push(requestAnimationFrame(() => {
						el.style.transition = `transform ${DURATION_MS}ms ease-out`;
						el.style.transform = "";
					}));
				}
			}
		});
		previous.current = next;
		return () => {
			for (const handle of handles) cancelAnimationFrame(handle);
		};
	}, [orderSignature]);
	return register;
}
//#endregion
export { useFlipReorder };

//# sourceMappingURL=use-flip-reorder.js.map