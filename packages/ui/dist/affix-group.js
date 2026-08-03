import { cn } from "./lib/utils.js";
import { IconRenderer } from "./icons/icon-renderer.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/affix-group.tsx
function AffixSegment({ affix, side, squared = false }) {
	return /* @__PURE__ */ jsx("span", {
		"data-slot": `affix-${side}`,
		className: cn("inline-flex h-lt-control-md shrink-0 items-center border border-lt-input bg-lt-muted px-3 text-base whitespace-nowrap text-lt-muted-fg", "group-has-[:focus-visible]:border-lt-ring", side === "start" ? "rounded-l-lt-sm border-r-0" : "rounded-r-lt-sm border-l-0", squared && "rounded-r-none border-r-0"),
		children: affix.icon ? /* @__PURE__ */ jsx(IconRenderer, {
			className: "size-lt-icon-md",
			icon: affix.icon
		}) : affix.text
	});
}
/**
* Wraps a single-line control in a prefix/suffix input group. The control is a
* render prop receiving the class names that square the corners adjacent to an
* affix; with no affixes the control renders untouched.
*
* The focus ring lives on the group, not the bare input, so it surrounds the
* whole control — affixes included — instead of being clipped by the opaque
* affix segments. The control itself stays the focus target; only its own ring
* is suppressed.
*/
function AffixGroup({ prefix, suffix, end, children }) {
	if (!prefix && !suffix && !end) return children("");
	return /* @__PURE__ */ jsxs("div", {
		className: "group flex w-full rounded-lt-sm transition-[color,box-shadow] has-[:focus-visible]:ring-[length:var(--lt-ring-width)] has-[:focus-visible]:ring-lt-ring/50",
		"data-slot": "affix-group",
		children: [
			prefix ? /* @__PURE__ */ jsx(AffixSegment, {
				affix: prefix,
				side: "start"
			}) : null,
			/* @__PURE__ */ jsx("div", {
				className: "min-w-0 flex-1",
				children: children(cn("focus-visible:ring-0", prefix && "rounded-l-none", (suffix || end) && "rounded-r-none"))
			}),
			suffix ? /* @__PURE__ */ jsx(AffixSegment, {
				affix: suffix,
				side: "end",
				squared: Boolean(end)
			}) : null,
			end
		]
	});
}
//#endregion
export { AffixGroup };

//# sourceMappingURL=affix-group.js.map