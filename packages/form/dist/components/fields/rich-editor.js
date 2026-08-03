import { Suspense, lazy } from "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/components/fields/rich-editor.tsx
var RichEditorField = lazy(() => import("./rich-editor-field.js"));
var RichEditorComponent = ({ children, node }) => /* @__PURE__ */ jsx(Suspense, {
	fallback: null,
	children: /* @__PURE__ */ jsx(RichEditorField, {
		node,
		children
	})
});
//#endregion
export { RichEditorComponent };

//# sourceMappingURL=rich-editor.js.map