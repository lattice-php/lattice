import { ActionTriggerProvider } from "../click-behavior.js";
import { useAction } from "../hooks/use-action.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/action-trigger-provider.tsx
function ActionTrigger({ action, children }) {
	const { processing, requestSubmit, overlays } = useAction(action);
	return /* @__PURE__ */ jsxs(Fragment, { children: [children({
		onClick: requestSubmit,
		processing
	}), overlays] });
}
function ActionInteractionProvider({ children }) {
	return /* @__PURE__ */ jsx(ActionTriggerProvider, {
		render: (props) => /* @__PURE__ */ jsx(ActionTrigger, {
			action: props.action,
			children: props.children
		}),
		children
	});
}
//#endregion
export { ActionInteractionProvider, ActionTrigger };

//# sourceMappingURL=action-trigger-provider.js.map