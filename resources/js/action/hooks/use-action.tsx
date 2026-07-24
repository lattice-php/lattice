import { router } from "@inertiajs/react";
import type { Method } from "@inertiajs/core";
import { useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@lattice-php/lattice/ui/confirm-dialog";
import { apiFetch } from "@lattice-php/lattice/core/api";
import { withHeaders } from "@lattice-php/lattice/core/headers";
import type { Node } from "@lattice-php/lattice/core/types";
import { translate } from "@lattice-php/lattice/i18n";
import { useEffectDispatcher } from "@lattice-php/lattice/effects/use-effect-dispatcher";
import { runAction } from "@lattice-php/lattice/action/lib/run-action";
import { ActionForm, useLazyActionForm } from "@lattice-php/lattice/action/components/action-form";
import { actionLabel } from "@lattice-php/lattice/action/lib/action-label";

type UseAction = {
  /** Whether the action request is in flight. */
  processing: boolean;
  /** Gate then run the action: open the form, confirm, or dispatch directly. */
  requestSubmit: () => void;
  /** The confirm dialog and action form rendered next to the trigger. */
  overlays: ReactNode;
};

/**
 * The shared action machinery behind the Action button, action menu items, and
 * action links: it gates submission (form → modal, confirmation → confirm,
 * otherwise dispatch) and renders the matching overlays. The host owns the
 * trigger element so each surface keeps its own styling.
 */
export function useAction(node: Node<"action" | "action.bulk">): UseAction {
  const endpoint = node.props.endpoint ?? "";
  const componentRef = node.props.ref ?? "";
  const method: Method = node.props.method ?? "post";
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

  const submit = async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    if (method === "get") {
      router.visit(endpoint, { headers: withHeaders(componentRef) });
      setIsConfirming(false);

      return;
    }

    setProcessing(true);

    const ok = await runAction(
      () => apiFetch(endpoint, { method, ref: componentRef, throwOnError: false }),
      dispatch,
    );

    setProcessing(false);

    if (ok) {
      setIsConfirming(false);
    }
  };

  const requestSubmit = (): void => {
    if (hasForm) {
      setIsFilling(true);

      return;
    }

    if (confirmation) {
      setIsConfirming(true);

      return;
    }

    void submit();
  };

  const confirmationTitle = confirmation?.title ?? label;
  const confirmationConfirmLabel = confirmation?.confirmLabel ?? label;
  const confirmationCancelLabel =
    confirmation?.cancelLabel ?? translate("lattice", "common.cancel", "Cancel");

  const overlays = (
    <>
      {isConfirming && confirmation && (
        <ConfirmDialog
          title={confirmationTitle}
          description={confirmation.description ?? undefined}
          confirmLabel={confirmationConfirmLabel}
          cancelLabel={confirmationCancelLabel}
          confirmVariant={variant}
          confirmEmphasis={emphasis}
          processing={processing}
          confirmDisabled={!endpoint}
          onConfirm={() => void submit()}
          onCancel={() => setIsConfirming(false)}
        />
      )}

      {isFilling && hasForm && (
        <ActionForm
          cancelLabel={confirmationCancelLabel}
          componentRef={componentRef}
          description={confirmation?.description ?? undefined}
          endpoint={endpoint}
          formNode={formNode}
          method={method}
          onClose={() => setIsFilling(false)}
          onSuccess={() => {
            setIsFilling(false);
          }}
          placement={node.props.modalSide ?? "center"}
          submitLabel={confirmationConfirmLabel}
          title={confirmationTitle}
          width={node.props.modalWidth ?? undefined}
        />
      )}
    </>
  );

  return { processing, requestSubmit, overlays };
}
