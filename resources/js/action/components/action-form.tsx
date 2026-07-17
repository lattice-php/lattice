import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@lattice-php/lattice/core/api";
import { Button } from "@lattice-php/lattice/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  type DialogPlacement,
} from "@lattice-php/lattice/ui/dialog";
import { Skeleton } from "@lattice-php/lattice/ui/skeleton";
import { Spinner } from "@lattice-php/lattice/ui/spinner";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { Node } from "@lattice-php/lattice/core/types";
import type { ModalWidth } from "@lattice-php/lattice/types/generated";
import {
  collectFields,
  FORM_DEBOUNCE_MS,
  FormProvider,
  FormValuesProvider,
  firstErrors,
  PrefillProvider,
  ResolvedNodesProvider,
  useFormResolver,
  useFormValues,
} from "@lattice-php/lattice/form/embed";
import type { FieldErrors } from "@lattice-php/lattice/form/embed";
import { useDebouncedCallback } from "@lattice-php/lattice/lib/use-debounced-callback";
import { useT } from "@lattice-php/lattice/i18n";
import { dispatchActionError } from "@lattice-php/lattice/effects/dispatch";
import type { ActionResponse } from "@lattice-php/lattice/effects/dispatch";

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
  onClose: () => void;
  onSuccess: (response: ActionResponse) => void;
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
): Node | null {
  const [node, setNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!enabled) {
      setNode(null);

      return;
    }

    const controller = new AbortController();

    void apiFetch(endpoint, {
      body: JSON.stringify({ _form: true }),
      ref: componentRef,
      method: "POST",
      signal: controller.signal,
      throwOnError: false,
    })
      .then((response) => (response.ok ? (response.json() as Promise<Node>) : null))
      .then((fetched) => setNode(fetched))
      .catch(() => {});

    return () => controller.abort();
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
  onClose,
  onSuccess,
  precognitive,
  submitLabel,
}: Omit<ActionFormProps, "description" | "title"> & {
  fieldLabels: Record<string, string>;
  formNode: Node;
  precognitive: boolean;
}) {
  const values = useFormValues();
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const extraDataRef = useRef(extraData);
  extraDataRef.current = extraData;
  const { nodes: resolvedNodes, markUserEdit } = useFormResolver(
    endpoint,
    componentRef,
    formNode.schema,
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [processing, setProcessing] = useState(false);

  const request = useCallback(
    (extraHeaders?: Record<string, string>): Promise<Response> =>
      apiFetch(endpoint, {
        body: JSON.stringify({ ...valuesRef.current, ...extraDataRef.current }),
        method,
        ref: componentRef,
        headers: extraHeaders,
        throwOnError: false,
      }),
    [componentRef, endpoint, method],
  );

  const clearErrors = useCallback((field: string) => {
    setErrors((current) =>
      current[field] === undefined ? current : { ...current, [field]: undefined },
    );
  }, []);

  const runValidation = useDebouncedCallback((field: string) => {
    void request({ Precognition: "true", "Precognition-Validate-Only": field })
      .then(async (response) => {
        if (response.status === 422) {
          const body = (await response.json()) as { errors?: Record<string, string[]> };
          setErrors((current) => ({ ...current, ...firstErrors(body.errors) }));

          return;
        }

        clearErrors(field);
      })
      .catch(() => {});
  }, FORM_DEBOUNCE_MS);

  const validate = useCallback(
    (field: string) => {
      if (precognitive) {
        runValidation(field);
      }
    },
    [precognitive, runValidation],
  );

  const submit = useCallback(() => {
    setProcessing(true);

    void request()
      .then(async (response) => {
        if (response.status === 422) {
          const body = (await response.json()) as { errors?: Record<string, string[]> };
          setErrors(firstErrors(body.errors));

          return;
        }

        if (!response.ok) {
          dispatchActionError(new Error(`Action request failed with status ${response.status}`));

          return;
        }

        onSuccess((await response.json()) as ActionResponse);
      })
      .catch((error: unknown) => dispatchActionError(error))
      .finally(() => setProcessing(false));
  }, [onSuccess, request]);

  const context = useMemo(
    () => ({
      action: endpoint,
      clearErrors,
      componentRef,
      errors,
      fieldLabels,
      precognitive,
      processing,
      validate,
    }),
    [clearErrors, componentRef, endpoint, errors, fieldLabels, precognitive, processing, validate],
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
            variant="ghost"
          >
            {cancelLabel}
          </Button>

          <Button data-test="action-form-submit" disabled={processing} type="submit">
            {processing && <Spinner />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function ActionFormContent({
  formNode,
  ...rest
}: Omit<ActionFormProps, "description" | "title"> & { formNode: Node }) {
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
  placement,
  title,
  width,
  ...rest
}: ActionFormProps) {
  const { t } = useT("lattice");

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
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
