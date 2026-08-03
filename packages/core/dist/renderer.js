import { useCollapsed } from "./collapsed-context.js";
import { nodeKey } from "./nodes.js";
import { useComponentRegistry } from "./registry-context.js";
import { Suspense, memo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/renderer.tsx
function MissingComponentIcon() {
	return /* @__PURE__ */ jsxs("svg", {
		"aria-hidden": "true",
		className: "size-lt-icon-md shrink-0",
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeWidth: "2",
		viewBox: "0 0 24 24",
		children: [
			/* @__PURE__ */ jsx("rect", {
				height: "18",
				rx: "2",
				strokeDasharray: "4 3",
				width: "18",
				x: "3",
				y: "3"
			}),
			/* @__PURE__ */ jsx("path", { d: "M12 8v4" }),
			/* @__PURE__ */ jsx("path", { d: "M12 16h.01" })
		]
	});
}
/**
* Fallback for a node whose type has no registered renderer. Always renders a
* visible, muted marker — icon-only survives tight spots like table cells — so
* the gap is never invisible. Shows the type inline in development; keeps it
* screen-reader-only (plus a hover tooltip) in production.
*/
function MissingComponent({ node }) {
	node.type;
	const label = `Missing component: ${node.type}`;
	return /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center gap-1.5 align-middle text-lt-muted-fg",
		"data-lattice-missing-component": node.type,
		title: label,
		children: [/* @__PURE__ */ jsx(MissingComponentIcon, {}), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: label
		})]
	});
}
function Renderer({ nodes }) {
	return nodes.map((node, index) => /* @__PURE__ */ jsx(NodeRenderer, { node }, nodeKey(node, index)));
}
function RenderNode({ node }) {
	return /* @__PURE__ */ jsx(NodeRenderer, { node });
}
var NodeRenderer = memo(function NodeRenderer({ node }) {
	const collapsed = useCollapsed();
	const registration = useComponentRegistry()[node.type];
	if (collapsed && node.props?.hideWhenCollapsed === true) return null;
	if (!registration) return /* @__PURE__ */ jsx(MissingComponent, { node });
	const Component = registration.component;
	const children = node.schema?.length ? /* @__PURE__ */ jsx(Renderer, { nodes: node.schema }) : null;
	const renderedComponent = /* @__PURE__ */ jsx(Component, {
		node,
		children
	});
	if (registration.mode === "lazy") return /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: renderedComponent
	});
	return renderedComponent;
});
//#endregion
export { RenderNode, Renderer };

//# sourceMappingURL=renderer.js.map