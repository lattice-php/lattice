import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { jsx } from "react/jsx-runtime";
import { isTruthy } from "@lattice-php/ui/lib/is-truthy";
//#region resources/js/components/cells/boolean-cell.tsx
var BooleanCell = ({ value }) => {
	const { t } = useT("lattice");
	const truthy = isTruthy(value);
	return /* @__PURE__ */ jsx("span", {
		"aria-label": truthy ? t("common.yes", "Yes") : t("common.no", "No"),
		role: "img",
		children: /* @__PURE__ */ jsx(Icon, {
			name: truthy ? "check" : "x",
			className: cn("size-lt-icon-md", truthy ? "text-lt-success" : "text-lt-muted-fg")
		})
	});
};
//#endregion
export { BooleanCell };

//# sourceMappingURL=boolean-cell.js.map