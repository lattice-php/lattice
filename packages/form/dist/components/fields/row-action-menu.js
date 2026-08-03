//#region resources/js/components/fields/row-action-menu.ts
/** Translation key + fallback and icon for each built-in; the server sends null labels. */
var BUILT_IN = {
	duplicate: {
		key: "table.row-actions.duplicate",
		fallback: "Duplicate",
		icon: "copy"
	},
	remove: {
		key: "table.row-actions.remove",
		fallback: "Remove",
		icon: "trash-2"
	}
};
/**
* Resolves the declared wire row actions into the click-wired client actions the
* kebab renders. `null` (undeclared) falls back to the built-in remove; an empty
* array disables row actions entirely. Remove is dropped while the row is at its
* minimum, and built-in labels resolve through i18n when the server sends none.
*/
function buildRowActions(declared, ctx) {
	return (declared ?? defaultActions(ctx.removable)).map((action) => toClientAction(action, ctx)).filter((action) => action !== null);
}
function defaultActions(removable) {
	if (!removable) return [];
	return [{
		type: "remove",
		key: "remove",
		label: null,
		icon: null,
		danger: true
	}];
}
function toClientAction(action, ctx) {
	if (action.type === "duplicate") {
		const builtIn = BUILT_IN.duplicate;
		return {
			key: action.key,
			label: action.label ?? ctx.t(builtIn.key, builtIn.fallback),
			icon: action.icon ?? builtIn.icon,
			danger: action.danger,
			onClick: () => ctx.onDuplicate(ctx.index)
		};
	}
	if (action.type === "remove") {
		if (!ctx.removable) return null;
		const builtIn = BUILT_IN.remove;
		return {
			key: action.key,
			label: action.label ?? ctx.t(builtIn.key, builtIn.fallback),
			icon: action.icon ?? builtIn.icon,
			danger: action.danger,
			onClick: () => ctx.onRemove(ctx.index)
		};
	}
	return null;
}
//#endregion
export { buildRowActions };

//# sourceMappingURL=row-action-menu.js.map