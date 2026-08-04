import { ActionMenuProvider } from "../action-menu-context.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@lattice-php/ui/button";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@lattice-php/ui/dropdown-menu";
import { cn } from "@lattice-php/ui/lib/utils";
//#region resources/js/components/action-group.tsx
var ActionGroupComponent = ({ children, node }) => {
	const { t } = useT("lattice");
	const label = node.props.label ?? t("common.action-group.label", "Actions");
	const orientation = node.props.orientation;
	if (orientation) return /* @__PURE__ */ jsx("div", {
		"aria-label": label,
		className: cn("inline-flex max-w-full gap-1", orientation === "vertical" ? "flex-col items-stretch" : "flex-row flex-wrap items-center"),
		"data-lattice-component": node.id,
		role: "group",
		children
	});
	return /* @__PURE__ */ jsx("div", {
		className: "inline-flex",
		"data-lattice-component": node.id,
		children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsx(Button, {
				"aria-label": label,
				className: "size-lt-control-sm text-lt-muted-fg shadow-none hover:text-lt-fg",
				"data-test": nodeIdentity(node),
				size: "icon",
				type: "button",
				emphasis: "ghost",
				children: /* @__PURE__ */ jsx(Icon, {
					name: "more-horizontal",
					"aria-hidden": "true",
					className: "size-lt-icon-md"
				})
			})
		}), /* @__PURE__ */ jsx(DropdownMenuContent, {
			align: "end",
			"aria-label": label,
			className: "min-w-44 gap-0.5 p-1.5",
			sideOffset: 8,
			children: /* @__PURE__ */ jsx(ActionMenuProvider, { children })
		})] })
	});
};
//#endregion
export { ActionGroupComponent as default };

//# sourceMappingURL=action-group.js.map