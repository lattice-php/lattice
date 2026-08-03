import { Icon } from "./icons/sprite.js";
import { useT } from "./i18n/instance.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/info-tooltip.tsx
function InfoTooltip({ content }) {
	const { t } = useT("lattice");
	if (!content) return null;
	return /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
		type: "button",
		"aria-label": t("common.more-info", "More information"),
		className: "ml-1 inline-flex rounded-lt-sm text-lt-muted-fg outline-none hover:text-lt-fg focus-visible:text-lt-fg focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]",
		children: /* @__PURE__ */ jsx(Icon, {
			name: "info",
			className: "size-lt-icon-sm"
		})
	}), /* @__PURE__ */ jsx(PopoverContent, {
		align: "start",
		className: "max-w-xs p-3 text-sm [&_a]:underline",
		dangerouslySetInnerHTML: { __html: content }
	})] });
}
//#endregion
export { InfoTooltip };

//# sourceMappingURL=info-tooltip.js.map