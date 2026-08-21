import type { Node } from "@lattice-php/core/types";
import { ActionForm, useLazyActionForm } from "@lattice-php/action/components/action-form";
import { MODAL_MISSING_ERROR, useEmbeddedModal } from "@lattice-php/ui/components/modal/modal-host";
import { confirmationLabels } from "@lattice-php/action/lib/confirmation";

export function ActionFormOverlay({
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
  const method = node.props.method ?? "post";
  const lazyForm = node.props.lazyForm === true;
  const lazyNode = useLazyActionForm(endpoint, componentRef, lazyForm, extraData);
  const formNode = lazyForm ? lazyNode : node.props.form;
  const labels = confirmationLabels(node);

  return (
    <ActionForm
      open={context.open}
      onExited={context.onExited}
      cancelLabel={labels.cancelLabel}
      componentRef={componentRef}
      description={labels.description}
      endpoint={endpoint}
      extraData={extraData}
      formNode={formNode}
      method={method}
      onClose={() => context.onOpenChange(false)}
      onSuccess={() => {
        context.onOpenChange(false);
        onSuccess?.();
      }}
      placement={node.props.modalSide ?? "center"}
      submitLabel={labels.confirmLabel}
      title={labels.title}
      width={node.props.modalWidth ?? undefined}
    />
  );
}
