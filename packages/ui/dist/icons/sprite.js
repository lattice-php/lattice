import { cn } from "../lib/utils.js";
import { createContext, useContext } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/icons/sprite.tsx
var SpriteContext = createContext({ href: "" });
/**
* Seeds the icon sprite for everything below it. When `sprite.source` is set
* (dev), it's injected once so same-document `<use href="#id">` references
* resolve; in builds `href` points at the emitted sprite asset instead.
*/
function SpriteProvider({ children, sprite }) {
	return /* @__PURE__ */ jsxs(SpriteContext.Provider, {
		value: sprite,
		children: [sprite.source ? /* @__PURE__ */ jsx("div", {
			hidden: true,
			dangerouslySetInnerHTML: { __html: sprite.source }
		}) : null, children]
	});
}
function useSprite() {
	return useContext(SpriteContext);
}
/**
* Renders a single sprite symbol by name. Used for Lattice's own UI chrome and
* as the resolved default for server-driven icons. Extra `<svg>` props are
* forwarded, so callers can override `aria-hidden`, set a `role`, etc.
*/
function Icon({ className, name, ...props }) {
	const { href, ids } = useSprite();
	return /* @__PURE__ */ jsx("svg", {
		"aria-hidden": "true",
		...props,
		className: cn("size-lt-icon-md", className),
		children: /* @__PURE__ */ jsx("use", { href: `${href}#${name}` })
	});
}
//#endregion
export { Icon, SpriteProvider, useSprite };

//# sourceMappingURL=sprite.js.map