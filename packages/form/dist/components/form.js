import { FormSubmitButton } from "./base/submit-button.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { refreshRef } from "@lattice-php/core/api";
import { RenderNode } from "@lattice-php/core/renderer";
import { useT } from "@lattice-php/ui/i18n";
import { jsx, jsxs } from "react/jsx-runtime";
import { FormProvider } from "@lattice-php/form/hooks/context";
import { nodeKey } from "@lattice-php/core/nodes";
import { FormValuesProvider, useResetFormValues } from "@lattice-php/form/hooks/values";
import { ResolvedNodesProvider } from "@lattice-php/form/hooks/resolved-nodes";
import { Form } from "@inertiajs/react";
import { withHeaders } from "@lattice-php/core/headers";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
import { collectFields } from "@lattice-php/form/lib/collect-fields";
import { PrefillProvider } from "@lattice-php/form/hooks/prefill-context";
import { useFormResolver } from "@lattice-php/form/hooks/use-form-resolver";
//#region resources/js/components/form.tsx
var JUSTIFY_CLASS = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
	around: "justify-around",
	evenly: "justify-evenly"
};
function FormResetListener({ componentId, reset }) {
	const resetValues = useResetFormValues();
	useWindowEvent(LATTICE_EVENT.resetForm, (event) => {
		const detail = event.detail;
		if (!detail?.form || detail.form === componentId) {
			reset();
			resetValues();
		}
	});
	return null;
}
function FormBody({ action, children, componentRef, nodes, shouldRenderSubmitButton, submitButtons, submitEmphasis, submitJustify, submitLabel, submitVariant, summaryLabel }) {
	const { nodes: resolvedNodes, markUserEdit } = useFormResolver(action, componentRef, nodes);
	const prefill = useMemo(() => ({ markUserEdit }), [markUserEdit]);
	return /* @__PURE__ */ jsx(PrefillProvider, {
		value: prefill,
		children: /* @__PURE__ */ jsx(ResolvedNodesProvider, {
			nodes: resolvedNodes,
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-6",
				children: [children, shouldRenderSubmitButton && /* @__PURE__ */ jsx("div", {
					className: `flex gap-3 ${JUSTIFY_CLASS[submitJustify ?? "end"]}`,
					children: submitButtons?.length ? submitButtons.map((button, index) => button.props.buttonType === "submit" ? /* @__PURE__ */ jsx(FormSubmitButton, {
						emphasis: button.props.emphasis ?? submitEmphasis,
						label: button.props.label ?? submitLabel,
						summaryLabel,
						variant: button.props.variant ?? submitVariant
					}, nodeKey(button, index)) : /* @__PURE__ */ jsx(RenderNode, { node: button }, nodeKey(button, index))) : /* @__PURE__ */ jsx(FormSubmitButton, {
						emphasis: submitEmphasis,
						label: submitLabel,
						summaryLabel,
						variant: submitVariant
					})
				})]
			})
		})
	});
}
function configuredResetFields(configured) {
	if (!configured || Array.isArray(configured) && configured.length === 0) return false;
	return Array.isArray(configured) ? configured : void 0;
}
var FormComponent = ({ children, node }) => {
	const initialValues = useMemo(() => ({
		...collectFields(node.schema).values,
		...node.props.state
	}), [node.schema, node.props.state]);
	return /* @__PURE__ */ jsx(FormValuesProvider, {
		initial: initialValues,
		children: /* @__PURE__ */ jsx(FormShell, {
			node,
			children
		})
	});
};
function FormShell({ children, node }) {
	const { t } = useT("lattice");
	const props = node.props;
	const action = props.action ?? "#";
	const errorBag = props.errorBag;
	const componentRef = props.ref ?? "";
	const method = props.method ?? "post";
	const precognitive = props.precognitive;
	const resetOnError = props.resetOnError ?? false;
	const resetOnSuccess = props.resetOnSuccess ?? [];
	const fieldLabels = useMemo(() => collectFields(node.schema).labels, [node.schema]);
	const shouldRenderSubmitButton = props.submitButton;
	const submitButtons = props.submitButtons ?? void 0;
	const submitJustify = props.submitJustify ?? void 0;
	const submitLabel = props.submitLabel ?? t("form.submit", "Submit");
	const submitVariant = props.submitVariant ?? void 0;
	const submitEmphasis = props.submitEmphasis ?? void 0;
	const summaryLabel = props.validationSummaryLabel;
	const validationTimeout = props.validationTimeout ?? void 0;
	const resetValues = useResetFormValues();
	const resetConfigured = (configured) => {
		const fields = configuredResetFields(configured);
		if (fields !== false) resetValues(fields);
	};
	const formRef = useRef(null);
	const retryPhase = useRef("idle");
	const [renewedSubmitTick, setRenewedSubmitTick] = useState(0);
	useEffect(() => {
		if (renewedSubmitTick > 0 && retryPhase.current === "renewing") formRef.current?.submit();
	}, [renewedSubmitTick]);
	return /* @__PURE__ */ jsx(Form, {
		ref: formRef,
		action,
		"data-slot": "form",
		"data-lattice-component": node.id,
		errorBag,
		method,
		resetOnError,
		resetOnSuccess,
		validationTimeout: precognitive ? validationTimeout : void 0,
		headers: withHeaders(componentRef),
		className: "mx-auto flex w-full max-w-2xl flex-col gap-6",
		onStart: () => {
			retryPhase.current = retryPhase.current === "renewing" ? "retried" : "idle";
		},
		onSuccess: () => resetConfigured(resetOnSuccess),
		onError: () => resetConfigured(resetOnError),
		onHttpException: (response) => {
			if (response.status !== 403 || componentRef === "" || retryPhase.current === "retried") return;
			retryPhase.current = "renewing";
			refreshRef(componentRef).finally(() => setRenewedSubmitTick((tick) => tick + 1));
			return false;
		},
		children: ({ clearErrors, errors, processing, reset, touch, validate, validating }) => /* @__PURE__ */ jsxs(FormProvider, {
			value: {
				action,
				clearErrors: (field) => clearErrors(field),
				componentId: node.id,
				componentRef,
				errors,
				fieldLabels,
				precognitive,
				processing,
				touch: (fields) => touch(...fields),
				validate: (field) => validate(field),
				validateFields: (fields, options) => validate({
					only: fields,
					...options
				}),
				validating
			},
			children: [
				/* @__PURE__ */ jsx(FormResetListener, {
					componentId: node.id,
					reset
				}),
				props.status && /* @__PURE__ */ jsx("div", {
					className: "text-center text-sm font-medium text-lt-success",
					children: props.status
				}),
				/* @__PURE__ */ jsx(FormBody, {
					action,
					componentRef,
					nodes: node.schema,
					shouldRenderSubmitButton,
					submitButtons,
					submitEmphasis,
					submitJustify,
					submitLabel,
					submitVariant,
					summaryLabel,
					children
				})
			]
		})
	});
}
//#endregion
export { FormComponent };

//# sourceMappingURL=form.js.map