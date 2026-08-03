/**
 * Called by the editor field when its chunk loads. Registration must be an
 * explicitly invoked export: the package ships side-effect-free modules, so a
 * bare `import "./builtins"` would be tree-shaken out of production builds.
 */
export declare function registerBuiltinRichEditorExtensions(): void;
