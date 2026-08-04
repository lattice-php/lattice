import { apiFetch } from "@lattice-php/core/api";
import { useState } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { prefixedTestId } from "@lattice-php/core/test-id";
import { ActionForm } from "@lattice-php/form/action-form";
import { Button } from "@lattice-php/ui/button";
import { ConfirmDialog } from "@lattice-php/ui/confirm-dialog";
import { runAction } from "@lattice-php/ui/effects/run-action";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { Spinner } from "@lattice-php/ui/spinner";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/bulk-bar.tsx
function BulkBar({ actions, selectedKeys, allMatching, total, query, canSelectAllMatching, onSelectAllMatching, onCompleted }) {
	const { t } = useT("lattice");
	const [processing, setProcessing] = useState(false);
	const dispatch = useEffectDispatcher();
	const [confirming, setConfirming] = useState(null);
	const [filling, setFilling] = useState(null);
	const selectionPayload = () => allMatching ? {
		allMatching: true,
		...query
	} : { selected: selectedKeys };
	async function submit(action) {
		setProcessing(true);
		const ok = await runAction(() => apiFetch(action.endpoint, {
			method: action.method,
			ref: action.ref,
			body: JSON.stringify(selectionPayload()),
			throwOnError: false
		}), dispatch);
		setProcessing(false);
		if (ok) {
			setConfirming(null);
			onCompleted();
		}
	}
	function run(action) {
		if (action.form) {
			setFilling(action);
			return;
		}
		if (action.confirmation) {
			setConfirming(action);
			return;
		}
		submit(action);
	}
	const count = allMatching ? total ?? selectedKeys.length : selectedKeys.length;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center gap-3 border-b border-lt-border bg-lt-muted/50 p-4 text-sm",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "font-medium",
				children: allMatching ? t("table.bulk.all-selected", "All {{count}} selected", { count }) : t("table.bulk.selected", "{{count}} selected", { count })
			}),
			canSelectAllMatching && /* @__PURE__ */ jsx("button", {
				type: "button",
				"data-test": "bulk-select-all-matching",
				className: "font-medium text-lt-primary underline underline-offset-2",
				onClick: onSelectAllMatching,
				children: t("table.bulk.select-all-matching", "Select all {{total}} matching", { total })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap items-center gap-2",
				children: actions.map((action) => /* @__PURE__ */ jsxs(Button, {
					type: "button",
					"data-test": prefixedTestId("bulk-action", action.id),
					variant: action.variant,
					emphasis: action.emphasis,
					disabled: processing,
					onClick: () => run(action),
					children: [processing && /* @__PURE__ */ jsx(Spinner, {}), action.label]
				}, action.id))
			}),
			confirming?.confirmation && /* @__PURE__ */ jsx(ConfirmDialog, {
				title: confirming.confirmation.title ?? confirming.label,
				description: confirming.confirmation.description ?? void 0,
				confirmLabel: confirming.confirmation.confirmLabel ?? confirming.label,
				cancelLabel: confirming.confirmation.cancelLabel ?? t("common.cancel", "Cancel"),
				confirmVariant: confirming.variant,
				confirmEmphasis: confirming.emphasis,
				processing,
				onConfirm: () => void submit(confirming),
				onCancel: () => setConfirming(null)
			}),
			filling?.form && /* @__PURE__ */ jsx(ActionForm, {
				cancelLabel: filling.confirmation?.cancelLabel ?? t("common.cancel", "Cancel"),
				componentRef: filling.ref,
				description: filling.confirmation?.description ?? void 0,
				endpoint: filling.endpoint,
				extraData: selectionPayload(),
				formNode: filling.form,
				method: filling.method,
				onClose: () => setFilling(null),
				onSuccess: () => {
					setFilling(null);
					onCompleted();
				},
				placement: filling.modalSide ?? "center",
				submitLabel: filling.confirmation?.confirmLabel ?? filling.label,
				title: filling.confirmation?.title ?? filling.label,
				width: filling.modalWidth ?? void 0
			})
		]
	});
}
//#endregion
export { BulkBar };

//# sourceMappingURL=bulk-bar.js.map