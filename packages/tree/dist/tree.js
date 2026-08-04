import { TreeContext, useTreeContext, useTreeState } from "./tree-context.js";
import { Renderer, nodeIdentity } from "@lattice-php/core";
import { useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { Icon, cn, useT } from "@lattice-php/ui";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/tree.tsx
function isExpandable(node, children, canLoad) {
	return Boolean(children?.length) || node.hasChildren === true && (canLoad || Boolean(node.children?.length));
}
var ORDER_PATH_SEGMENT_WIDTH = 6;
function orderPathSegment(index) {
	return String(index).padStart(ORDER_PATH_SEGMENT_WIDTH, "0");
}
function TreeItem({ depth, node, orderPath, parentPath, siblingCount, siblingIndex }) {
	const { activate, activeId, canLoad, childrenFor, expanded, focusedId, isLoading, loadChildren, moveFocus, register, toggle, typeAhead, unregister } = useTreeContext();
	const { t } = useT("tree");
	const ref = useRef(null);
	const path = parentPath ? `${parentPath}/${node.id}` : node.id;
	const isExpanded = expanded.has(node.id);
	const isActive = activeId === node.id;
	const isFocused = focusedId === node.id;
	const isDisabled = node.disabled === true;
	const children = node.children ?? childrenFor(node.id);
	const expandable = isExpandable(node, children, canLoad);
	const loading = isLoading(node.id);
	const bodyRef = useRef(null);
	useEffect(() => {
		if (isExpanded && node.hasChildren === true && !node.children && !children) loadChildren(node.id);
	}, [
		isExpanded,
		node,
		children,
		loadChildren
	]);
	useEffect(() => {
		register({
			id: node.id,
			label: node.label,
			orderPath,
			parentPath,
			path,
			ref
		});
		return () => unregister(path);
	}, [
		node.id,
		node.label,
		orderPath,
		parentPath,
		path,
		register,
		unregister
	]);
	useEffect(() => {
		const container = bodyRef.current;
		if (!container) return;
		container.querySelectorAll("button, a[href], [tabindex]").forEach((control) => {
			control.tabIndex = -1;
		});
	}, [node.schema]);
	function onKeyDown(event) {
		if (event.target !== event.currentTarget) return;
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveFocus(node.id, "next");
				return;
			case "ArrowUp":
				event.preventDefault();
				moveFocus(node.id, "prev");
				return;
			case "ArrowRight":
				event.preventDefault();
				if (expandable && !isExpanded) toggle(node.id);
				else if (expandable) moveFocus(node.id, "firstChild");
				return;
			case "ArrowLeft":
				event.preventDefault();
				if (expandable && isExpanded) toggle(node.id);
				else moveFocus(node.id, "parent");
				return;
			case "Home":
				event.preventDefault();
				moveFocus(node.id, "first");
				return;
			case "End":
				event.preventDefault();
				moveFocus(node.id, "last");
				return;
			case "Enter":
			case " ":
				event.preventDefault();
				if (isDisabled) return;
				if (node.href) router.visit(node.href);
				else {
					const trigger = bodyRef.current?.querySelector("button");
					if (trigger) {
						trigger.click();
						ref.current?.focus();
					} else activate(node.id);
				}
				return;
			default: if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeAhead(node.id, event.key);
		}
	}
	return /* @__PURE__ */ jsxs("li", {
		"aria-disabled": isDisabled,
		"aria-expanded": expandable ? isExpanded : void 0,
		"aria-label": node.label,
		"aria-level": depth,
		"aria-posinset": siblingIndex,
		"aria-selected": isActive,
		"aria-setsize": siblingCount,
		"data-test": `tree-node-${node.id}`,
		onKeyDown,
		ref,
		role: "treeitem",
		tabIndex: isFocused ? 0 : -1,
		children: [/* @__PURE__ */ jsxs("div", {
			className: cn("flex items-center gap-2 rounded-lt-sm px-2 py-1.5 text-sm text-lt-fg", isActive && "bg-lt-muted font-medium", isDisabled && "pointer-events-none opacity-50"),
			children: [expandable ? /* @__PURE__ */ jsx("button", {
				"aria-label": isExpanded ? t("tree.collapse", "Collapse {{label}}", { label: node.label }) : t("tree.expand", "Expand {{label}}", { label: node.label }),
				"data-test": `tree-node-${node.id}-toggle`,
				onClick: () => toggle(node.id),
				tabIndex: -1,
				type: "button",
				children: loading ? /* @__PURE__ */ jsx(Icon, {
					className: "size-lt-icon-md shrink-0 animate-spin",
					name: "loader-2"
				}) : /* @__PURE__ */ jsx(Icon, {
					className: cn("size-lt-icon-md shrink-0 transition-transform", isExpanded && "rotate-90"),
					name: "chevron-right"
				})
			}) : null, /* @__PURE__ */ jsx("span", {
				className: "flex min-w-0 flex-1 items-center gap-2",
				ref: bodyRef,
				children: /* @__PURE__ */ jsx(Renderer, { nodes: node.schema })
			})]
		}), expandable && isExpanded && children && children.length > 0 ? /* @__PURE__ */ jsx("ul", {
			className: "pl-6",
			role: "group",
			children: children.map((child, index) => /* @__PURE__ */ jsx(TreeItem, {
				depth: depth + 1,
				node: child,
				orderPath: `${orderPath}.${orderPathSegment(index)}`,
				parentPath: path,
				siblingCount: children.length,
				siblingIndex: index + 1
			}, child.id))
		}) : null]
	});
}
var TreeComponent = ({ node }) => {
	const identity = nodeIdentity(node);
	const value = useTreeState({
		activeId: node.props.activeId,
		defaultExpanded: node.props.defaultExpanded,
		endpoint: node.props.endpoint ?? null,
		componentRef: node.props.ref ?? null,
		lazy: node.props.lazy === true,
		nodes: node.props.nodes,
		rememberState: node.props.rememberState,
		storageKey: `lattice:tree:${identity ?? "default"}`
	});
	const roots = node.props.nodes.length > 0 ? node.props.nodes : value.childrenFor("") ?? [];
	return /* @__PURE__ */ jsx(TreeContext.Provider, {
		value,
		children: /* @__PURE__ */ jsx("ul", {
			"data-lattice-component": identity,
			role: "tree",
			children: roots.map((child, index) => /* @__PURE__ */ jsx(TreeItem, {
				depth: 1,
				node: child,
				orderPath: orderPathSegment(index),
				parentPath: null,
				siblingCount: roots.length,
				siblingIndex: index + 1
			}, child.id))
		})
	});
};
//#endregion
export { TreeComponent as default };

//# sourceMappingURL=tree.js.map