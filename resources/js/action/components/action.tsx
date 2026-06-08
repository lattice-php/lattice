import { router, useHttp } from "@inertiajs/react";
import type { Method } from "@inertiajs/core";
import { useState } from "react";
import { Button } from "@lattice/core/components/button";
import { Spinner } from "@lattice/core/components/spinner";
import { getStringProp } from "@lattice/core/props";
import type { NodeProps, RendererComponent } from "@lattice/core/types";
import { IconRenderer } from "@lattice/icons";
import { dispatchActionEffects, dispatchActionError, isActionEffect } from "../effects";
import type { ActionEffect } from "../effects";

type ActionVariant = "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";

type ActionConfirmation = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  title?: string;
};

type ActionResponse = {
  data?: Record<string, unknown>;
  effects?: ActionEffect[];
  ok?: boolean;
};

type ActionData = {
  _lattice?: string;
};

declare module "@lattice/core/types" {
  interface ComponentProps {
    action: {
      confirmation?: ActionConfirmation;
      effects?: ActionEffect[];
      endpoint?: string;
      icon?: string;
      label?: string;
      ref?: string;
      method?: Method;
      variant?: ActionVariant;
    };
  }
}

const actionMethods = ["delete", "get", "patch", "post", "put"] satisfies Method[];

function getActionMethod(props: NodeProps | undefined): Method {
  const method = getStringProp(props, "method", "post");

  return actionMethods.includes(method as Method) ? (method as Method) : "post";
}

function getActionEffects(effects: unknown): ActionEffect[] {
  return Array.isArray(effects) ? effects.filter(isActionEffect) : [];
}

function endpointWithRef(endpoint: string, componentRef: string): string {
  if (!componentRef) {
    return endpoint;
  }

  const url = new URL(endpoint, window.location.origin);

  url.searchParams.set("_lattice", componentRef);

  return `${url.pathname}${url.search}`;
}

function getConfirmation(props: NodeProps | undefined): ActionConfirmation | null {
  const confirmation = props?.confirmation;

  if (typeof confirmation !== "object" || confirmation === null || Array.isArray(confirmation)) {
    return null;
  }

  return confirmation;
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

  const submit = async (): Promise<void> => {
    if (!endpoint) {
      return;
    }

    try {
      if (method === "get") {
        router.visit(endpointWithRef(endpoint, componentRef));
        setIsConfirming(false);

        return;
      }

      http.transform((data) => ({
        ...data,
        ...(componentRef ? { _lattice: componentRef } : {}),
      }));

      const response = await http[method](endpoint);
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
        variant={node.props?.variant ?? "default"}
      >
        {http.processing ? <Spinner /> : icon && <IconRenderer className="size-4" icon={icon} />}
        {label}
      </Button>

      {isConfirming && confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            aria-labelledby={`${node.id ?? "lattice-action"}-confirmation-title`}
            aria-modal="true"
            className="w-full max-w-md rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lg"
            role="dialog"
          >
            <div className="grid gap-2">
              <h2
                className="text-lg font-semibold leading-none tracking-tight"
                id={`${node.id ?? "lattice-action"}-confirmation-title`}
              >
                {confirmationTitle}
              </h2>

              {confirmation.description && (
                <p className="text-sm text-lt-muted-fg">{confirmation.description}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                disabled={http.processing}
                onClick={() => setIsConfirming(false)}
                type="button"
                variant="outline"
              >
                {confirmationCancelLabel}
              </Button>
              <Button
                disabled={http.processing || !endpoint}
                onClick={() => void submit()}
                type="button"
                variant={node.props?.variant ?? "default"}
              >
                {http.processing && <Spinner />}
                {confirmationConfirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionComponent;
