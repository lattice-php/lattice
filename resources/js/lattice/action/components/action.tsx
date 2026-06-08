import { router, useHttp } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getStringProp } from "@/lattice/core/props";
import type { LatticeNodeProps, LatticeRendererComponent } from "@/lattice/core/types";
import { IconRenderer } from "@/lattice/icons";
import { dispatchActionEffects, dispatchActionError, isActionEffect } from "../effects";
import type { LatticeActionEffect } from "../effects";

type LatticeActionMethod = "delete" | "get" | "patch" | "post" | "put";
type LatticeActionVariant = "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";

type LatticeActionConfirmation = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  title?: string;
};

type LatticeActionResponse = {
  data?: Record<string, unknown>;
  effects?: LatticeActionEffect[];
  ok?: boolean;
};

type LatticeActionData = {
  _lattice?: string;
};

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    action: {
      confirmation?: LatticeActionConfirmation;
      effects?: LatticeActionEffect[];
      endpoint?: string;
      icon?: string;
      label?: string;
      ref?: string;
      method?: LatticeActionMethod;
      variant?: LatticeActionVariant;
    };
  }
}

const actionMethods = ["delete", "get", "patch", "post", "put"] satisfies LatticeActionMethod[];

function getActionMethod(props: LatticeNodeProps | undefined): LatticeActionMethod {
  const method = getStringProp(props, "method", "post");

  return actionMethods.includes(method as LatticeActionMethod)
    ? (method as LatticeActionMethod)
    : "post";
}

function getActionEffects(effects: unknown): LatticeActionEffect[] {
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

function getConfirmation(props: LatticeNodeProps | undefined): LatticeActionConfirmation | null {
  const confirmation = props?.confirmation;

  if (typeof confirmation !== "object" || confirmation === null || Array.isArray(confirmation)) {
    return null;
  }

  return confirmation;
}

const ActionComponent: LatticeRendererComponent<"action"> = ({ node }) => {
  const endpoint = getStringProp(node.props, "endpoint");
  const icon = getStringProp(node.props, "icon");
  const label = getStringProp(node.props, "label", "Run action");
  const componentRef = getStringProp(node.props, "ref");
  const method = getActionMethod(node.props);
  const http = useHttp<LatticeActionData, LatticeActionResponse>({});
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
            className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
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
                <p className="text-sm text-muted-foreground">{confirmation.description}</p>
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
