import { router } from "@inertiajs/react";
import type { Method } from "@inertiajs/core";
import { useContext, useState } from "react";
import { apiFetch } from "@lattice-php/core/api";
import { withHeaders } from "@lattice-php/core/headers";
import type { Node } from "@lattice-php/core/types";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { MODAL_MISSING_ERROR, useOptionalModal } from "@lattice-php/ui/components/modal/modal-host";
import type { ActionSubmitOptions } from "@lattice-php/ui/click-behavior";
import { runAction } from "@lattice-php/action/lib/run-action";
import { ActionConfirmOverlay } from "@lattice-php/action/components/action-confirm-overlay";
import { ActionFormOverlay } from "@lattice-php/action/components/action-form-overlay";

export type { ActionSubmitOptions } from "@lattice-php/ui/click-behavior";

type UseAction = {
  /** Whether the direct-submit request is in flight (form/confirm overlays track their own). */
  processing: boolean;
  /** Gate then run the action: open the form, confirm, or dispatch directly. */
  requestSubmit: () => void;
};

/**
 * The shared action machinery behind the Action button, action menu items, and
 * action links: it gates submission (form → modal, confirmation → confirm,
 * otherwise dispatch) and pushes the matching overlay onto the modal host. The
 * host is read lazily so a direct-submit action never needs a
 * ModalProvider in scope.
 */
export function useAction(
  node: Node<"action" | "action.bulk">,
  options?: ActionSubmitOptions,
): UseAction {
  const endpoint = node.props.endpoint ?? "";
  const componentRef = node.props.ref ?? "";
  const method: Method = node.props.method ?? "post";
  const confirmation = node.props.confirmation;
  const inlineForm = node.props.form;
  const lazyForm = node.props.lazyForm === true;
  const hasForm = Boolean(inlineForm) || lazyForm;

  const [processing, setProcessing] = useState(false);
  const dispatch = useEffectDispatcher();
  const host = useOptionalModal();

  const submit = async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    const extraData = options?.extraData?.();

    if (method === "get") {
      router.visit(endpoint, { headers: withHeaders(componentRef) });

      return;
    }

    options?.onBefore?.();
    setProcessing(true);

    const ok = await runAction(
      () =>
        apiFetch(endpoint, {
          method,
          ref: componentRef,
          body: extraData ? JSON.stringify(extraData) : undefined,
          throwOnError: false,
        }),
      dispatch,
    );

    setProcessing(false);

    if (ok) {
      options?.onSuccess?.();
    } else {
      options?.onError?.();
    }
  };

  const requestSubmit = (): void => {
    if (hasForm) {
      if (!host) {
        throw new Error(MODAL_MISSING_ERROR);
      }

      host.open(
        <ActionFormOverlay
          node={node}
          extraData={options?.extraData?.()}
          onBefore={options?.onBefore}
          onError={options?.onError}
          onSuccess={options?.onSuccess}
        />,
      );

      return;
    }

    if (confirmation) {
      if (!host) {
        throw new Error(MODAL_MISSING_ERROR);
      }

      host.open(
        <ActionConfirmOverlay
          node={node}
          extraData={options?.extraData?.()}
          onBefore={options?.onBefore}
          onError={options?.onError}
          onSuccess={options?.onSuccess}
        />,
      );

      return;
    }

    void submit();
  };

  return { processing, requestSubmit };
}
