import { cn } from "./lib/utils.js";
import { Icon } from "./icons/sprite.js";
import { useT } from "./i18n/instance.js";
import { jsx } from "react/jsx-runtime";
//#region resources/js/spinner.tsx
function Spinner({ className, ...props }) {
	const { t } = useT("lattice");
	return /* @__PURE__ */ jsx(Icon, {
		name: "loader-2",
		role: "status",
		"aria-label": t("common.loading", "Loading"),
		"aria-hidden": false,
		className: cn("animate-spin", className),
		...props
	});
}
//#endregion
export { Spinner };

//# sourceMappingURL=spinner.js.map