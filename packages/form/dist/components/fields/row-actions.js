import { useT } from "@lattice-php/ui/i18n";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@lattice-php/ui/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@lattice-php/ui/dropdown-menu";
//#region resources/js/components/fields/row-actions.tsx
function inlineClass(danger) {
	return danger ? "text-lt-danger hover:text-lt-danger [&_svg]:size-lt-icon-sm" : "text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm";
}
function RowActions({ actions }) {
	const { t } = useT("lattice");
	if (actions.length === 0) return null;
	if (actions.length === 1) {
		const action = actions[0];
		return /* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": action.label,
			"data-test": `row-action-${action.key}`,
			className: inlineClass(action.danger),
			onClick: action.onClick,
			children: /* @__PURE__ */ jsx(Icon, { name: action.icon })
		});
	}
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": t("common.action-group.label", "Actions"),
			"data-test": "row-actions-menu",
			className: "text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm",
			children: /* @__PURE__ */ jsx(Icon, { name: "more-horizontal" })
		})
	}), /* @__PURE__ */ jsx(DropdownMenuContent, {
		align: "end",
		className: "min-w-[10rem]",
		children: actions.map((action) => /* @__PURE__ */ jsx(DropdownMenuItem, {
			"data-test": `row-action-${action.key}`,
			danger: action.danger,
			icon: action.icon,
			onClick: action.onClick,
			children: action.label
		}, action.key))
	})] });
}
//#endregion
export { RowActions };

//# sourceMappingURL=row-actions.js.map