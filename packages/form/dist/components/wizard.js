import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useT } from "@lattice-php/ui/i18n";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { Button } from "@lattice-php/ui/button";
import { Spinner } from "@lattice-php/ui/spinner";
import { firstErroredStep, stepFieldNames, stepValidationPaths, stepsWithErrors } from "@lattice-php/form/lib/wizard-steps";
//#region resources/js/components/wizard.tsx
var WizardContext = createContext({ activeName: "" });
function getSteps(node) {
	const nodes = (node.schema ?? []).filter((child) => child.type === "wizard-step");
	return {
		items: nodes.map((child) => child.props),
		nodes
	};
}
var WizardComponent = ({ children, node }) => {
	const { t } = useT("lattice");
	const { errors, processing, touch, validateFields, validating } = useFormContext();
	const { items, nodes } = useMemo(() => getSteps(node), [node]);
	const stepNames = useMemo(() => nodes.map((step) => stepFieldNames(step)), [nodes]);
	const isVertical = node.props.orientation === "vertical";
	const [activeIndex, setActiveIndex] = useState(0);
	const [visited, setVisited] = useState(() => /* @__PURE__ */ new Set([0]));
	const [completed, setCompleted] = useState(() => /* @__PURE__ */ new Set());
	const erroredSteps = useMemo(() => stepsWithErrors(stepNames, errors), [stepNames, errors]);
	const isLast = activeIndex === items.length - 1;
	const goTo = (index) => {
		setActiveIndex(index);
		setVisited((previous) => new Set(previous).add(index));
	};
	const advance = () => {
		setCompleted((previous) => new Set(previous).add(activeIndex));
		if (!isLast) goTo(activeIndex + 1);
	};
	const onNext = () => {
		const step = nodes[activeIndex];
		const paths = step ? stepValidationPaths(step) : [];
		if (paths.length === 0) {
			advance();
			return;
		}
		touch(paths);
		validateFields(paths, { onSuccess: advance });
	};
	const wasProcessing = useRef(false);
	useEffect(() => {
		if (wasProcessing.current && !processing) {
			const target = firstErroredStep(stepNames, errors);
			if (target !== null && target !== activeIndex) goTo(target);
		}
		wasProcessing.current = processing;
	}, [
		processing,
		errors,
		stepNames,
		activeIndex
	]);
	const contextValue = useMemo(() => ({ activeName: items[activeIndex]?.name ?? "" }), [items, activeIndex]);
	return /* @__PURE__ */ jsx(WizardContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsxs("div", {
			className: cn("gap-6", isVertical ? "flex" : "grid"),
			"data-slot": "wizard",
			children: [/* @__PURE__ */ jsx("ol", {
				"aria-label": t("form.wizard.steps", "Steps"),
				className: cn("gap-1", isVertical ? "flex w-56 shrink-0 flex-col" : "flex flex-wrap"),
				children: items.map((step, index) => {
					const isActive = index === activeIndex;
					const isDone = completed.has(index);
					const hasError = erroredSteps.has(index);
					return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						"aria-current": isActive ? "step" : void 0,
						className: cn("flex w-full items-center gap-2 rounded-lt px-3 py-2 text-left text-sm", isActive ? "bg-lt-muted font-medium text-lt-fg" : "text-lt-muted-fg", !visited.has(index) && "cursor-not-allowed opacity-60"),
						"data-error": hasError || void 0,
						"data-test": `wizard-rail-${step.name}`,
						disabled: !visited.has(index),
						id: `wizard-step-${step.name}-trigger`,
						onClick: () => goTo(index),
						type: "button",
						children: [/* @__PURE__ */ jsx("span", {
							className: cn("flex size-5 shrink-0 items-center justify-center rounded-full border text-xs", hasError ? "border-lt-danger text-lt-danger" : isDone ? "border-lt-primary bg-lt-primary text-lt-primary-fg" : "border-lt-border"),
							children: isDone && !hasError ? /* @__PURE__ */ jsx(Icon, {
								className: "size-lt-icon-sm",
								name: "check"
							}) : index + 1
						}), /* @__PURE__ */ jsxs("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block truncate",
								children: step.label
							}), isVertical && step.description && /* @__PURE__ */ jsx("span", {
								className: "block truncate text-xs text-lt-muted-fg",
								children: step.description
							})]
						})]
					}) }, step.name);
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1 space-y-6",
				children: [children, /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						"data-test": "wizard-back",
						disabled: activeIndex === 0 || processing,
						onClick: () => goTo(activeIndex - 1),
						type: "button",
						emphasis: "outline",
						children: t("form.wizard.back", "Back")
					}), isLast ? /* @__PURE__ */ jsxs(Button, {
						"data-test": "wizard-finish",
						disabled: processing,
						type: "submit",
						children: [processing && /* @__PURE__ */ jsx(Spinner, {}), t("form.wizard.finish", "Finish")]
					}) : /* @__PURE__ */ jsxs(Button, {
						"data-test": "wizard-next",
						disabled: processing || validating,
						onClick: onNext,
						type: "button",
						children: [validating && /* @__PURE__ */ jsx(Spinner, {}), t("form.wizard.next", "Next")]
					})]
				})]
			})]
		})
	});
};
var WizardStepComponent = ({ children, node }) => {
	const { activeName } = useContext(WizardContext);
	const name = node.props.name;
	const isActive = activeName === name;
	const [hasOpened, setHasOpened] = useState(isActive);
	useEffect(() => {
		if (isActive) setHasOpened(true);
	}, [isActive]);
	return /* @__PURE__ */ jsx("section", {
		"aria-labelledby": `wizard-step-${name}-trigger`,
		className: cn("space-y-8", !isActive && "hidden"),
		hidden: !isActive,
		id: `wizard-step-${name}-panel`,
		children: hasOpened ? children : null
	});
};
//#endregion
export { WizardComponent, WizardStepComponent };

//# sourceMappingURL=wizard.js.map