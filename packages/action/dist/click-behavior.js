import { createContext, useContext } from "react";
import { Fragment, jsx } from "react/jsx-runtime";
import { getActionEffects } from "@lattice-php/ui/effects/dispatch";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
//#region resources/js/click-behavior.tsx
var ActionTriggerContext = createContext(null);
function isActionNode(node) {
	return node.type === "action" || node.type === "action.bulk";
}
function ActionTriggerProvider({ children, render }) {
	return /* @__PURE__ */ jsx(ActionTriggerContext.Provider, {
		value: render,
		children
	});
}
function useActionTrigger() {
	return useContext(ActionTriggerContext);
}
function ActionTrigger({ action, children }) {
	const render = useActionTrigger();
	if (!render) throw new Error("Action triggers require an ActionTriggerProvider.");
	return /* @__PURE__ */ jsx(Fragment, { children: render({
		action,
		children
	}) });
}
function useClickBehavior(props) {
	const dispatch = useEffectDispatcher();
	const action = props.action ?? null;
	const effects = props.effects ?? [];
	if (action) {
		if (!isActionNode(action)) throw new Error("Clickable action nodes must have type [action] or [action.bulk].");
		return {
			kind: "action",
			action
		};
	}
	if (effects.length > 0) return {
		kind: "effects",
		onClick: () => dispatch(getActionEffects(effects))
	};
	if (props.href != null && props.href !== "") return {
		kind: "navigate",
		href: props.href,
		method: props.method ?? "get"
	};
	return { kind: "none" };
}
//#endregion
export { ActionTrigger, ActionTriggerProvider, useActionTrigger, useClickBehavior };

//# sourceMappingURL=click-behavior.js.map