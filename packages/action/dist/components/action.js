import { actionMenuItemClassName, useActionMenu } from "../action-menu-context.js";
import { actionLabel } from "../lib/action-label.js";
import { useAction } from "../hooks/use-action.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@lattice-php/ui/button";
import { Spinner } from "@lattice-php/ui/spinner";
import { prefixedTestId } from "@lattice-php/core/test-id";
import { IconRenderer } from "@lattice-php/ui/icons";
//#region resources/js/components/action.tsx
var ActionComponent = ({ node }) => {
	const endpoint = node.props.endpoint ?? "";
	const icon = node.props.icon;
	const label = actionLabel(node);
	const isMenuItem = useActionMenu();
	const { variant, emphasis } = node.props;
	const { processing, requestSubmit, overlays } = useAction(node);
	const testId = node.key ?? prefixedTestId("action", node.id);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Button, {
		className: isMenuItem ? actionMenuItemClassName : void 0,
		"data-lattice-component": node.id,
		"data-test": testId,
		disabled: processing || !endpoint,
		onClick: requestSubmit,
		type: "button",
		emphasis: isMenuItem ? "ghost" : emphasis,
		variant: isMenuItem ? null : variant,
		children: [processing ? /* @__PURE__ */ jsx(Spinner, { className: isMenuItem ? "size-lt-icon-sm" : void 0 }) : icon && /* @__PURE__ */ jsx(IconRenderer, {
			className: isMenuItem ? "size-lt-icon-sm" : "size-lt-icon-md",
			icon
		}), label]
	}), overlays] });
};
//#endregion
export { ActionComponent as default };

//# sourceMappingURL=action.js.map