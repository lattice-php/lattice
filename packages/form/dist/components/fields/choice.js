import { useMemo } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useSeedDefault } from "@lattice-php/form/hooks/use-seed-default";
import { SegmentedPills } from "@lattice-php/ui/segmented-pills";
import { useControlledField } from "@lattice-php/form/hooks/use-controlled-field";
import { useResolvedNode } from "@lattice-php/form/hooks/resolved-nodes";
//#region resources/js/components/fields/choice.tsx
var ChoiceComponent = ({ node }) => {
	const resolvedNode = useResolvedNode(node);
	const { localName, name, testId, value, error, hidden, required, readOnly, disabled, commit } = useControlledField(node);
	const options = useMemo(() => resolvedNode.props.options ?? [], [resolvedNode.props]);
	const fallbackValue = options[0]?.value ?? "";
	const selected = value || fallbackValue;
	useSeedDefault(localName, selected || void 0);
	if (hidden || options.length === 0) return null;
	return /* @__PURE__ */ jsx(FormFieldFrame, {
		error,
		helperText: node.props.helperText ?? void 0,
		tooltip: node.props.tooltip ?? void 0,
		label: node.props.label ?? "",
		id: name,
		required,
		children: (controlProps) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("input", {
			name,
			type: "hidden",
			value: selected
		}), /* @__PURE__ */ jsx(SegmentedPills, {
			...controlProps,
			ariaLabel: node.props.label ?? void 0,
			autoFocus: node.props.autoFocus ?? void 0,
			disabled: readOnly || disabled,
			name: testId ?? "segment",
			onSelect: commit,
			options,
			tabIndex: node.props.tabIndex ?? void 0,
			value: selected
		})] })
	});
};
//#endregion
export { ChoiceComponent };

//# sourceMappingURL=choice.js.map