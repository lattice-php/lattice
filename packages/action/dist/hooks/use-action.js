import { run_action_exports } from "../lib/run-action.js";
import { actionLabel } from "../lib/action-label.js";
import { useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { router } from "@inertiajs/react";
import { ConfirmDialog } from "@lattice-php/ui/confirm-dialog";
import { apiFetch } from "@lattice-php/core/api";
import { withHeaders } from "@lattice-php/core/headers";
import { translate } from "@lattice-php/ui/i18n";
import { ActionForm, useLazyActionForm } from "@lattice-php/form/action-form";
//#region resources/js/hooks/use-action.tsx
/**
* The shared action machinery behind the Action button, action menu items, and
* action links: it gates submission (form → modal, confirmation → confirm,
* otherwise dispatch) and renders the matching overlays. The host owns the
* trigger element so each surface keeps its own styling.
*/
function useAction(node) {
	const endpoint = node.props.endpoint ?? "";
	const componentRef = node.props.ref ?? "";
	const method = node.props.method ?? "post";
	const label = actionLabel(node);
	const { variant, emphasis } = node.props;
	const confirmation = node.props.confirmation;
	const inlineForm = node.props.form;
	const lazyForm = node.props.lazyForm === true;
	const hasForm = Boolean(inlineForm) || lazyForm;
	const [processing, setProcessing] = useState(false);
	const dispatch = useEffectDispatcher();
	const [isConfirming, setIsConfirming] = useState(false);
	const [isFilling, setIsFilling] = useState(false);
	const lazyNode = useLazyActionForm(endpoint, componentRef, isFilling && lazyForm);
	const formNode = lazyForm ? lazyNode : inlineForm;
	const submit = async () => {
		if (!endpoint) return;
		if (method === "get") {
			router.visit(endpoint, { headers: withHeaders(componentRef) });
			setIsConfirming(false);
			return;
		}
		setProcessing(true);
		const ok = await (0, run_action_exports.runAction)(() => apiFetch(endpoint, {
			method,
			ref: componentRef,
			throwOnError: false
		}), dispatch);
		setProcessing(false);
		if (ok) setIsConfirming(false);
	};
	const requestSubmit = () => {
		if (hasForm) {
			setIsFilling(true);
			return;
		}
		if (confirmation) {
			setIsConfirming(true);
			return;
		}
		submit();
	};
	const confirmationTitle = confirmation?.title ?? label;
	const confirmationConfirmLabel = confirmation?.confirmLabel ?? label;
	const confirmationCancelLabel = confirmation?.cancelLabel ?? translate("lattice", "common.cancel", "Cancel");
	return {
		processing,
		requestSubmit,
		overlays: /* @__PURE__ */ jsxs(Fragment, { children: [isConfirming && confirmation && /* @__PURE__ */ jsx(ConfirmDialog, {
			title: confirmationTitle,
			description: confirmation.description ?? void 0,
			confirmLabel: confirmationConfirmLabel,
			cancelLabel: confirmationCancelLabel,
			confirmVariant: variant,
			confirmEmphasis: emphasis,
			processing,
			confirmDisabled: !endpoint,
			onConfirm: () => void submit(),
			onCancel: () => setIsConfirming(false)
		}), isFilling && hasForm && /* @__PURE__ */ jsx(ActionForm, {
			cancelLabel: confirmationCancelLabel,
			componentRef,
			description: confirmation?.description ?? void 0,
			endpoint,
			formNode,
			method,
			onClose: () => setIsFilling(false),
			onSuccess: () => {
				setIsFilling(false);
			},
			placement: node.props.modalSide ?? "center",
			submitLabel: confirmationConfirmLabel,
			title: confirmationTitle,
			width: node.props.modalWidth ?? void 0
		})] })
	};
}
//#endregion
export { useAction };

//# sourceMappingURL=use-action.js.map