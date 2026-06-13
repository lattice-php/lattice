import { router, useHttp } from "@inertiajs/react";
import type { Method } from "@inertiajs/core";
import { useState } from "react";
import { withRefHeader } from "@lattice-php/lattice/core/component-ref";
import { Button } from "@lattice-php/lattice/core/components/button";
import { ConfirmDialog } from "@lattice-php/lattice/core/components/confirm-dialog";
import { Spinner } from "@lattice-php/lattice/core/components/spinner";
import { prefixedTestId } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { IconRenderer } from "@lattice-php/lattice/icons";
import { dispatchActionEffects, dispatchActionError, getActionEffects } from "../effects";
import type { ActionResponse } from "../effects";
import { ActionForm, useLazyActionForm } from "./action-form";

const ActionComponent: RendererComponent<"action"> = ({ node }) => {
  const endpoint = node.props.endpoint ?? "";
  const icon = node.props.icon;
  const label = node.props.label ?? "Run action";
  const componentRef = node.props.ref ?? "";
  const method: Method = node.props.method ?? "post";
  const http = useHttp<Record<string, never>, ActionResponse>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const confirmation = node.props.confirmation;
  const variant = node.props.variant ?? "default";
  const inlineForm = node.props.form;
  const lazyForm = node.props.lazyForm === true;
  const hasForm = Boolean(inlineForm) || lazyForm;
  const lazyNode = useLazyActionForm(endpoint, method, componentRef, isFilling && lazyForm);
  const formNode = lazyForm ? lazyNode : inlineForm;

  const submit = async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    try {
      if (method === "get") {
        router.visit(endpoint, { headers: withRefHeader(componentRef) });
        setIsConfirming(false);

        return;
      }

      const response = await http[method](endpoint, { headers: withRefHeader(componentRef) });
      const responseEffects = getActionEffects(response.effects);

      dispatchActionEffects(
        responseEffects.length > 0 ? responseEffects : getActionEffects(node.props.effects),
      );
      setIsConfirming(false);
    } catch (error) {
      dispatchActionError(error);
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
  const confirmationCancelLabel = confirmation?.cancelLabel ?? "Cancel";
  const testId = node.key ?? prefixedTestId("action", node.id);

  return (
    <>
      <Button
        data-lattice-component={node.id}
        data-test={testId}
        disabled={http.processing || !endpoint}
        onClick={requestSubmit}
        type="button"
        variant={variant}
      >
        {http.processing ? (
          <Spinner />
        ) : (
          icon && <IconRenderer className="size-lt-icon-md" icon={icon} />
        )}
        {label}
      </Button>

      {isConfirming && confirmation && (
        <ConfirmDialog
          title={confirmationTitle}
          description={confirmation.description ?? undefined}
          confirmLabel={confirmationConfirmLabel}
          cancelLabel={confirmationCancelLabel}
          confirmVariant={variant}
          processing={http.processing}
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
          onSuccess={(response) => {
            const responseEffects = getActionEffects(response.effects);

            dispatchActionEffects(
              responseEffects.length > 0 ? responseEffects : getActionEffects(node.props.effects),
            );
            setIsFilling(false);
          }}
          submitLabel={confirmationConfirmLabel}
          title={confirmationTitle}
        />
      )}
    </>
  );
};

export default ActionComponent;
