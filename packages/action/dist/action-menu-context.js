import { createContext, useContext } from "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/action-menu-context.tsx
var ActionMenuContext = createContext(false);
var actionMenuItemClassName = "flex h-lt-control-sm w-full items-center justify-start gap-2 rounded-lt-sm px-2.5 text-left text-sm font-normal text-lt-popover-fg no-underline decoration-transparent shadow-none transition-colors hover:bg-lt-accent/70 hover:text-lt-popover-fg focus-visible:bg-lt-accent/70 focus-visible:text-lt-popover-fg focus-visible:ring-0 focus-visible:outline-none disabled:pointer-events-none disabled:text-lt-disabled-fg [&_svg]:size-lt-icon-sm [&_svg]:text-lt-muted-fg";
function ActionMenuProvider({ children }) {
	return /* @__PURE__ */ jsx(ActionMenuContext.Provider, {
		value: true,
		children
	});
}
function useActionMenu() {
	return useContext(ActionMenuContext);
}
//#endregion
export { ActionMenuProvider, actionMenuItemClassName, useActionMenu };

//# sourceMappingURL=action-menu-context.js.map