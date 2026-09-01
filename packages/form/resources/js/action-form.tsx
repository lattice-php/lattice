import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@lattice-php/core/api";
import { Button } from "@lattice-php/ui/components/button/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  type DialogPlacement,
} from "@lattice-php/ui/primitives/dialog";
import { Skeleton } from "@lattice-php/ui/primitives/skeleton";
import { Spinner } from "@lattice-php/ui/primitives/spinner";
import { Renderer } from "@lattice-php/core/renderer";
import type { Node } from "@lattice-php/core/types";
import type { ModalWidth } from "@lattice-php/ui/types";
import {
  collectFields,
  FormProvider,
  FormValuesProvider,
  PrefillProvider,
  ResolvedNodesProvider,
  useFormResolver,
} from "./embed";
import { useFetchForm } from "./hooks/use-fetch-form";
import { useT } from "@lattice-php/ui/i18n";
import type { ActionResponse } from "@lattice-php/ui/effects/dispatch";

type ActionFormProps = {
  cancelLabel: string;
  componentRef: string;
  description?: string;
  endpoint: string;
  /** Extra payload merged into every request, e.g. a bulk action's selection. */
  extraData?: Record<string, unknown>;
  /** The form to render; null while a lazy schema is still being fetched. */
  formNode: Node | null;
  method: string;
  onBefore?: () => void;
  onClose: () => void;
  onError?: () => void;
  /** Called by the host stack once the dialog's exit animation finishes. */
  onExited?: (event: Event) => void;
  onSuccess: (response: ActionResponse) => void;
  open: boolean;
  /** Dialog placement for the form modal; sheets dock to a viewport edge. */
  placement?: DialogPlacement;
  submitLabel: string;
  title: string;
  width?: ModalWidth;
};

/**
 * Fetch a lazily-served form schema from the action endpoint while `enabled`,
 * so it can be prefilled per record. Returns null until it arrives.
 */
export function useLazyActionForm(
  endpoint: string,
  componentRef: string,
  enabled: boolean,
  extraData?: Record<string, unknown>,
): Node | null {
  const [node, setNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!enabled) {
      setNode(null);

      return;
    }

    const controller = new AbortController();

    void apiFetch(endpoint, {
      body: JSON.stringify({ _sub: "schema", ...extraData }),
      ref: componentRef,
      method: "POST",
      signal: controller.signal,
      throwOnError: false,
    })
      .then((response) => (response.ok ? (response.json() as Promise<Node>) : null))
      .then((fetched) => setNode(fetched))
      .catch(() => {});

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, endpoint, componentRef]);

  return node;
}

function ActionFormSkeleton() {
  return (
    <div className="space-y-4" data-lattice-action-form-loading>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function ActionFormBody({
  cancelLabel,
  componentRef,
  endpoint,
  extraData,
  fieldLabels,
  formNode,
  method,
  onBefore,
  onClose,
  onError,
  onSuccess,
  precognitive,
  submitLabel,
}: Omit<ActionFormProps, "description" | "onExited" | "open" | "placement" | "title" | "width"> & {
  fieldLabels: Record<string, string>;
  formNode: Node;
  precognitive: boolean;
}) {
  const { nodes: resolvedNodes, markUserEdit } = useFormResolver(
    endpoint,
    componentRef,
    formNode.schema,
  );

  const { clearErrors, errors, processing, submit, touch, validate, validateFields, validating } =
    useFetchForm({
      componentRef,
      endpoint,
      extraData,
      method,
      onBefore,
      onError,
      onSuccess,
      precognitive,
    });

  const context = useMemo(
    () => ({
      action: endpoint,
      clearErrors,
      componentRef,
      errors,
      fieldLabels,
      precognitive,
      processing,
      touch,
      validate,
      validateFields,
      validating,
    }),
    [
      clearErrors,
      componentRef,
      endpoint,
      errors,
      fieldLabels,
      precognitive,
      processing,
      touch,
      validate,
      validateFields,
      validating,
    ],
  );

  return (
    <FormProvider value={context}>
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <PrefillProvider value={{ markUserEdit }}>
          <ResolvedNodesProvider nodes={resolvedNodes}>
            <Renderer nodes={formNode.schema ?? []} />
          </ResolvedNodesProvider>
        </PrefillProvider>

        <div className="flex justify-end gap-3">
          <Button
            data-test="action-form-cancel"
            disabled={processing}
            onClick={onClose}
            type="button"
            emphasis="ghost"
          >
            {cancelLabel}
          </Button>

          {formNode.props?.submitButton !== false && (
            <Button data-test="action-form-submit" disabled={processing} type="submit">
              {processing && <Spinner />}
              {submitLabel}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

function ActionFormContent({
  formNode,
  ...rest
}: Omit<ActionFormProps, "description" | "onExited" | "open" | "placement" | "title" | "width"> & {
  formNode: Node;
}) {
  const precognitive = Boolean(formNode.props?.precognitive);
  const { labels: fieldLabels, values: initialValues } = useMemo(() => {
    const { labels, values } = collectFields(formNode.schema);

    return {
      labels,
      values: { ...values, ...(formNode.props?.state as Record<string, unknown> | undefined) },
    };
  }, [formNode]);

  return (
    <FormValuesProvider initial={initialValues}>
      <ActionFormBody
        fieldLabels={fieldLabels}
        formNode={formNode}
        precognitive={precognitive}
        {...rest}
      />
    </FormValuesProvider>
  );
}

export function ActionForm({
  description,
  formNode,
  onClose,
  onExited,
  open,
  placement,
  title,
  width,
  ...rest
}: ActionFormProps) {
  const { t } = useT("lattice");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        onCloseAutoFocus={onExited}
        placement={placement}
        width={width}
      >
        <DialogHeader
          closeLabel={t("common.close", "Close")}
          description={description}
          title={title}
        />

        <div className="mt-6">
          {formNode ? (
            <ActionFormContent formNode={formNode} onClose={onClose} {...rest} />
          ) : (
            <ActionFormSkeleton />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
