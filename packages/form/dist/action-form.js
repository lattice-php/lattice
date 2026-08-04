import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@lattice-php/core/api";
import { Button } from "@lattice-php/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/dialog";
import { Skeleton } from "@lattice-php/ui/skeleton";
import { Spinner } from "@lattice-php/ui/spinner";
import { Renderer } from "@lattice-php/core/renderer";
import { FORM_DEBOUNCE_MS, FormProvider, FormValuesProvider, PrefillProvider, ResolvedNodesProvider, collectFields, errorKeyBelongsTo, firstErrors, useFormResolver, useFormValues } from "@lattice-php/form/embed";
import { useDebouncedCallback } from "@lattice-php/ui/lib/use-debounced-callback";
import { useT } from "@lattice-php/ui/i18n";
import { dispatchActionError, getActionEffects } from "@lattice-php/ui/effects/dispatch";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/action-form.tsx
/**
* Fetch a lazily-served form schema from the action endpoint while `enabled`,
* so it can be prefilled per record. Returns null until it arrives.
*/
function useLazyActionForm(endpoint, componentRef, enabled) {
	const [node, setNode] = useState(null);
	useEffect(() => {
		if (!enabled) {
			setNode(null);
			return;
		}
		const controller = new AbortController();
		apiFetch(endpoint, {
			body: JSON.stringify({ _sub: "schema" }),
			ref: componentRef,
			method: "POST",
			signal: controller.signal,
			throwOnError: false
		}).then((response) => response.ok ? response.json() : null).then((fetched) => setNode(fetched)).catch(() => {});
		return () => controller.abort();
	}, [
		enabled,
		endpoint,
		componentRef
	]);
	return node;
}
function ActionFormSkeleton() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		"data-lattice-action-form-loading": true,
		children: [
			/* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
			/* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" }),
			/* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" })
		]
	});
}
function ActionFormBody({ cancelLabel, componentRef, endpoint, extraData, fieldLabels, formNode, method, onClose, onSuccess, precognitive, submitLabel }) {
	const values = useFormValues();
	const valuesRef = useRef(values);
	valuesRef.current = values;
	const extraDataRef = useRef(extraData);
	extraDataRef.current = extraData;
	const { nodes: resolvedNodes, markUserEdit } = useFormResolver(endpoint, componentRef, formNode.schema);
	const dispatch = useEffectDispatcher();
	const [errors, setErrors] = useState({});
	const [processing, setProcessing] = useState(false);
	const [validating, setValidating] = useState(false);
	const request = useCallback((extraHeaders) => apiFetch(endpoint, {
		body: JSON.stringify({
			...valuesRef.current,
			...extraDataRef.current
		}),
		method,
		ref: componentRef,
		headers: extraHeaders,
		throwOnError: false
	}), [
		componentRef,
		endpoint,
		method
	]);
	const clearErrors = useCallback((field) => {
		setErrors((current) => current[field] === void 0 ? current : {
			...current,
			[field]: void 0
		});
	}, []);
	const runValidation = useDebouncedCallback((field) => {
		request({
			Precognition: "true",
			"Precognition-Validate-Only": field
		}).then(async (response) => {
			if (response.status === 422) {
				const body = await response.json();
				setErrors((current) => ({
					...current,
					...firstErrors(body.errors)
				}));
				return;
			}
			clearErrors(field);
		}).catch(() => {});
	}, FORM_DEBOUNCE_MS);
	const validate = useCallback((field) => {
		if (precognitive) runValidation(field);
	}, [precognitive, runValidation]);
	const touch = useCallback(() => {}, []);
	const validateFields = useCallback((fields, options) => {
		setValidating(true);
		request({
			Precognition: "true",
			"Precognition-Validate-Only": fields.join(",")
		}).then(async (response) => {
			if (response.status === 422) {
				const body = await response.json();
				setErrors((current) => ({
					...current,
					...firstErrors(body.errors)
				}));
				options?.onValidationError?.();
				return;
			}
			if (!response.ok) {
				options?.onValidationError?.();
				return;
			}
			const cleared = fields.filter((field) => !field.includes("*"));
			setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !cleared.some((name) => errorKeyBelongsTo(key, name)))));
			options?.onSuccess?.();
		}).catch(() => options?.onValidationError?.()).finally(() => setValidating(false));
	}, [request]);
	const submit = useCallback(() => {
		setProcessing(true);
		request().then(async (response) => {
			const body = await response.json().catch(() => ({}));
			dispatch(getActionEffects(body.effects));
			if (response.status === 422 && body.errors) {
				setErrors(firstErrors(body.errors));
				return;
			}
			if (!response.ok) return;
			onSuccess(body);
		}).catch((error) => dispatchActionError(error)).finally(() => setProcessing(false));
	}, [
		dispatch,
		onSuccess,
		request
	]);
	const context = useMemo(() => ({
		action: endpoint,
		clearErrors,
		componentRef,
		errors,
		fieldLabels,
		precognitive,
		processing,
		touch,
		validate,
		validateFields,
		validating
	}), [
		clearErrors,
		componentRef,
		endpoint,
		errors,
		fieldLabels,
		precognitive,
		processing,
		touch,
		validate,
		validateFields,
		validating
	]);
	return /* @__PURE__ */ jsx(FormProvider, {
		value: context,
		children: /* @__PURE__ */ jsxs("form", {
			className: "flex flex-col gap-6",
			onSubmit: (event) => {
				event.preventDefault();
				submit();
			},
			children: [/* @__PURE__ */ jsx(PrefillProvider, {
				value: { markUserEdit },
				children: /* @__PURE__ */ jsx(ResolvedNodesProvider, {
					nodes: resolvedNodes,
					children: /* @__PURE__ */ jsx(Renderer, { nodes: formNode.schema ?? [] })
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex justify-end gap-3",
				children: [/* @__PURE__ */ jsx(Button, {
					"data-test": "action-form-cancel",
					disabled: processing,
					onClick: onClose,
					type: "button",
					emphasis: "ghost",
					children: cancelLabel
				}), formNode.props?.submitButton !== false && /* @__PURE__ */ jsxs(Button, {
					"data-test": "action-form-submit",
					disabled: processing,
					type: "submit",
					children: [processing && /* @__PURE__ */ jsx(Spinner, {}), submitLabel]
				})]
			})]
		})
	});
}
function ActionFormContent({ formNode, ...rest }) {
	const precognitive = Boolean(formNode.props?.precognitive);
	const { labels: fieldLabels, values: initialValues } = useMemo(() => {
		const { labels, values } = collectFields(formNode.schema);
		return {
			labels,
			values: {
				...values,
				...formNode.props?.state
			}
		};
	}, [formNode]);
	return /* @__PURE__ */ jsx(FormValuesProvider, {
		initial: initialValues,
		children: /* @__PURE__ */ jsx(ActionFormBody, {
			fieldLabels,
			formNode,
			precognitive,
			...rest
		})
	});
}
function ActionForm({ description, formNode, onClose, placement, title, width, ...rest }) {
	const { t } = useT("lattice");
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		children: /* @__PURE__ */ jsxs(DialogContent, {
			...description ? {} : { "aria-describedby": void 0 },
			placement,
			width,
			children: [/* @__PURE__ */ jsx(DialogHeader, {
				closeLabel: t("common.close", "Close"),
				description,
				title
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-6",
				children: formNode ? /* @__PURE__ */ jsx(ActionFormContent, {
					formNode,
					onClose,
					...rest
				}) : /* @__PURE__ */ jsx(ActionFormSkeleton, {})
			})]
		})
	});
}
//#endregion
export { ActionForm, useLazyActionForm };

//# sourceMappingURL=action-form.js.map