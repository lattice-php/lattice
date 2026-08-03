import { useFieldScope } from "./field-scope.js";
import { createContext, useContext } from "react";
import { jsx } from "react/jsx-runtime";
import { fieldProps } from "@lattice-php/form/lib/field-props";
//#region resources/js/hooks/resolved-nodes.tsx
var ResolvedNodesContext = createContext({});
function ResolvedNodesProvider({ nodes, children }) {
	return /* @__PURE__ */ jsx(ResolvedNodesContext.Provider, {
		value: nodes,
		children
	});
}
function useResolvedNode(node) {
	const nodes = useContext(ResolvedNodesContext);
	const name = fieldProps(node).name ?? "";
	const scope = useFieldScope();
	const path = name && scope ? scope.errorKey(name) : name;
	return path && nodes[path] || name && nodes[name] || node;
}
//#endregion
export { ResolvedNodesProvider, useResolvedNode };

//# sourceMappingURL=resolved-nodes.js.map