import { cn } from "../lib/utils.js";
import { Icon, useSprite } from "./sprite.js";
import { createContext, useContext, useMemo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/icons/icon-renderer.tsx
var IconRenderersContext = createContext([]);
function IconRendererProvider({ children, renderer }) {
	const parentRenderers = useContext(IconRenderersContext);
	const renderers = useMemo(() => [renderer, ...parentRenderers], [parentRenderers, renderer]);
	return /* @__PURE__ */ jsx(IconRenderersContext.Provider, {
		value: renderers,
		children
	});
}
function IconRenderer({ className, icon }) {
	const renderers = useContext(IconRenderersContext);
	const { ids } = useSprite();
	for (const renderer of renderers) {
		const rendered = renderer({
			className,
			icon
		});
		if (rendered !== null && rendered !== void 0 && rendered !== false) return rendered;
	}
	if (ids && !ids.includes(icon)) return /* @__PURE__ */ jsx(MissingIcon, { className });
	return /* @__PURE__ */ jsx(Icon, {
		className,
		name: icon
	});
}
function MissingIcon({ className }) {
	return /* @__PURE__ */ jsxs("svg", {
		"aria-hidden": "true",
		className: cn("size-lt-icon-md text-lt-muted-fg", className),
		"data-lattice-missing-icon": "",
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeWidth: "2",
		viewBox: "0 0 24 24",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "10"
			}),
			/* @__PURE__ */ jsx("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }),
			/* @__PURE__ */ jsx("path", { d: "M12 17h.01" })
		]
	});
}
//#endregion
export { IconRenderer, IconRendererProvider };

//# sourceMappingURL=icon-renderer.js.map