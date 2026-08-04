import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@lattice-php/ui/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@lattice-php/ui/dropdown-menu";
//#region resources/js/components/fields/add-row-menu.tsx
function AddRowMenu({ addLabel, options, onSelect }) {
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs("button", {
			type: "button",
			"data-test": "builder-add",
			className: "inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm",
			children: [/* @__PURE__ */ jsx(Icon, { name: "plus" }), addLabel]
		})
	}), /* @__PURE__ */ jsx(DropdownMenuContent, {
		align: "start",
		className: "min-w-[12rem]",
		children: options.map((option) => /* @__PURE__ */ jsx(DropdownMenuItem, {
			"data-test": `builder-add-${option.type}`,
			onClick: () => onSelect(option.type),
			children: option.label
		}, option.type))
	})] });
}
//#endregion
export { AddRowMenu };

//# sourceMappingURL=add-row-menu.js.map