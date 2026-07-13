/**
 * Entry point for registering custom rich-editor extensions outside the
 * package. Modules not re-exported here are internal and may change without
 * notice.
 */
export {
  registerRichEditorExtension,
  type EditorExtensionPayloadOf,
  type EditorExtensionProps,
  type RichEditorExtensionDefinition,
  type ResolvedRichEditorExtension,
  type ToolbarButton,
  type ToolbarControl,
  type ToolbarEntry,
  type ToolbarItem,
} from "./registry";
