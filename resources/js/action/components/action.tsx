import { router, useHttp } from "@inertiajs/react";
import type { Method } from "@inertiajs/core";
import { useState, type ComponentProps as ReactComponentProps } from "react";
import { withRefHeader } from "@lattice/lattice/core/component-ref";
import { Button } from "@lattice/lattice/core/components/button";
import { ConfirmDialog } from "@lattice/lattice/core/components/confirm-dialog";
import { Spinner } from "@lattice/lattice/core/components/spinner";
import { getStringProp } from "@lattice/lattice/core/props";
import type { NodeProps, RendererComponent } from "@lattice/lattice/core/types";
import type { Action } from "@lattice/lattice/types/generated";
import { IconRenderer } from "@lattice/lattice/icons";
import { dispatchActionEffects, dispatchActionError, getActionEffects } from "../effects";
import type { ActionEffect } from "../effects";

type ActionConfirmation = NonNullable<Action["confirmation"]>;

type ButtonVariant = ReactComponentProps<typeof Button>["variant"];

type ActionResponse = {
  data?: Record<string, unknown>;
  effects?: ActionEffect[];
  ok?: boolean;
};

type ActionData = Record<string, never>;

const actionMethods = ["delete", "get", "patch", "post", "put"] satisfies Method[];

function getActionMethod(props: NodeProps | undefined): Method {
  const method = getStringProp(props, "method", "post");

  return actionMethods.includes(method as Method) ? (method as Method) : "post";
}

function getConfirmation(props: NodeProps | undefined): ActionConfirmation | null {
  const confirmation = props?.confirmation;

  if (typeof confirmation !== "object" || confirmation === null || Array.isArray(confirmation)) {
    return null;
  }

  return confirmation as ActionConfirmation;
}

const ActionComponent: RendererComponent<"action"> = ({ node }) => {
  const endpoint = getStringProp(node.props, "endpoint");
  const icon = getStringProp(node.props, "icon");
  const label = getStringProp(node.props, "label", "Run action");
  const componentRef = getStringProp(node.props, "ref");
  const method = getActionMethod(node.props);
  const http = useHttp<ActionData, ActionResponse>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmation = getConfirmation(node.props);
  const variant = (node.props?.variant ?? "default") as ButtonVariant;

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
        responseEffects.length > 0 ? responseEffects : getActionEffects(node.props?.effects),
      );
      setIsConfirming(false);
    } catch (error) {
      dispatchActionError(error);
    }
  };

  const requestSubmit = (): void => {
    if (confirmation) {
      setIsConfirming(true);

      return;
    }

    void submit();
  };

  const confirmationTitle = confirmation?.title ?? label;
  const confirmationConfirmLabel = confirmation?.confirmLabel ?? label;
  const confirmationCancelLabel = confirmation?.cancelLabel ?? "Cancel";

  return (
    <>
      <Button
        data-lattice-component={node.id}
        disabled={http.processing || !endpoint}
        onClick={requestSubmit}
        type="button"
        variant={variant}
      >
        {http.processing ? <Spinner /> : icon && <IconRenderer className="size-4" icon={icon} />}
        {label}
      </Button>

      {isConfirming && confirmation && (
        <ConfirmDialog
          title={confirmationTitle}
          description={confirmation.description}
          confirmLabel={confirmationConfirmLabel}
          cancelLabel={confirmationCancelLabel}
          confirmVariant={variant}
          processing={http.processing}
          confirmDisabled={!endpoint}
          onConfirm={() => void submit()}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </>
  );
};

export default ActionComponent;
