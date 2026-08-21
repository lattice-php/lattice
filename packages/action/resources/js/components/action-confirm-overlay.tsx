import { router } from "@inertiajs/react";
import type { Method } from "@inertiajs/core";
import { useState } from "react";
import { apiFetch } from "@lattice-php/core/api";
import { withHeaders } from "@lattice-php/core/headers";
import type { Node } from "@lattice-php/core/types";
import { ConfirmDialog } from "@lattice-php/ui/primitives/confirm-dialog";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { MODAL_MISSING_ERROR, useEmbeddedModal } from "@lattice-php/ui/components/modal/modal-host";
import { runAction } from "@lattice-php/action/lib/run-action";
import { confirmationLabels } from "@lattice-php/action/lib/confirmation";

export function ActionConfirmOverlay({
  node,
  extraData,
  onSuccess,
}: {
  node: Node<"action" | "action.bulk">;
  extraData?: Record<string, unknown>;
  onSuccess?: () => void;
}) {
  const context = useEmbeddedModal();

  if (!context) {
    throw new Error(MODAL_MISSING_ERROR);
  }

  const endpoint = node.props.endpoint ?? "";
  const componentRef = node.props.ref ?? "";
  const method: Method = node.props.method ?? "post";
  const { variant, emphasis } = node.props;
  const labels = confirmationLabels(node);

  const [processing, setProcessing] = useState(false);
  const dispatch = useEffectDispatcher();

  const submit = async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    if (method === "get") {
      router.visit(endpoint, { headers: withHeaders(componentRef) });
      context.onOpenChange(false);

      return;
    }

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
      context.onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <ConfirmDialog
      open={context.open}
      onExited={context.onExited}
      title={labels.title}
      description={labels.description}
      confirmLabel={labels.confirmLabel}
      cancelLabel={labels.cancelLabel}
      confirmVariant={variant}
      confirmEmphasis={emphasis}
      processing={processing}
      confirmDisabled={!endpoint}
      onConfirm={() => void submit()}
      onCancel={() => context.onOpenChange(false)}
    />
  );
}
