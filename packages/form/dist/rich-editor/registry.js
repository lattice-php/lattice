//#region resources/js/rich-editor/registry.ts
var registry = /* @__PURE__ */ new Map();
/**
* Wire props stay `Partial` at the definition boundary — a client-registered
* type's props carry no generated shape, so definitions default each field.
*/
function registerRichEditorExtension(type, definition) {
	registry.set(type, definition);
}
/**
* Registration that yields to an existing entry. The built-ins load with the
* lazy editor chunk — after app boot code ran — so seeding (instead of
* registering) keeps a consumer's deliberate override of a built-in type.
*
* @internal
*/
function seedRichEditorExtension(type, definition) {
	if (!registry.has(type)) registerRichEditorExtension(type, definition);
}
function resolveRichEditorExtensions(specs) {
	const resolved = [];
	for (const spec of specs) {
		const definition = registry.get(spec.type);
		if (!definition) continue;
		resolved.push({
			type: spec.type,
			props: spec.props,
			definition,
			group: definition.group ?? spec.type
		});
	}
	return resolved;
}
/**
* One shared StarterKit for the whole editor: the always-on baseline (document,
* paragraph, text, hard break, undo/redo, cursors and the invisible list/trailing
* helpers) plus whatever the active extensions re-enable. Everything else is
* explicitly disabled — StarterKit turns every feature on unless told otherwise.
*/
var DISABLED_STARTER_KIT_FEATURES = {
	blockquote: false,
	bold: false,
	bulletList: false,
	code: false,
	codeBlock: false,
	heading: false,
	horizontalRule: false,
	italic: false,
	link: false,
	listItem: false,
	orderedList: false,
	strike: false,
	underline: false
};
function assembleStarterKitOptions(extensions) {
	return extensions.reduce((options, extension) => ({
		...options,
		...extension.definition.starterKit?.(extension.props)
	}), { ...DISABLED_STARTER_KIT_FEATURES });
}
function assembleTiptapExtensions(extensions) {
	return extensions.flatMap((extension) => extension.definition.extensions?.(extension.props) ?? []);
}
function assembleToolbar(extensions) {
	const entries = [];
	let previousGroup = null;
	for (const extension of extensions) {
		const items = extension.definition.toolbar?.(extension.props) ?? [];
		if (items.length === 0) continue;
		if (previousGroup !== null && previousGroup !== extension.group) entries.push("separator");
		entries.push(...items);
		previousGroup = extension.group;
	}
	return entries;
}
//#endregion
export { assembleStarterKitOptions, assembleTiptapExtensions, assembleToolbar, registerRichEditorExtension, resolveRichEditorExtensions, seedRichEditorExtension };

//# sourceMappingURL=registry.js.map