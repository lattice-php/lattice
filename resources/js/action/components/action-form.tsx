import { Icon } from "@lattice/lattice/icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { withRefHeader } from "@lattice/lattice/core/component-ref";
import { Button } from "@lattice/lattice/core/components/button";
import { Spinner } from "@lattice/lattice/core/components/spinner";
import { Renderer, useRendererContext } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import { FormProvider } from "@lattice/lattice/form/components/context";
import { walkFields } from "@lattice/lattice/form/components/field-props";
import { FORM_DEBOUNCE_MS, xsrfToken } from "@lattice/lattice/form/components/form-transport";
import { ResolvedNodesProvider } from "@lattice/lattice/form/components/resolved-nodes";
import { useFormResolver } from "@lattice/lattice/form/components/use-form-resolver";
import { FormValuesProvider, useFormValues } from "@lattice/lattice/form/components/values";
import { useT } from "@lattice/lattice/i18n";
import { dispatchActionError } from "../effects";
import type { ActionResponse } from "../effects";

type FieldErrors = Record<string, string | undefined>;

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
  submitLabel: string;
  title: string;
};

function jsonHeaders(componentRef: string, extra?: Record<string, string>): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-XSRF-TOKEN": xsrfToken(),
    ...withRefHeader(componentRef),
    ...extra,
  };
}

/**
 * Fetch a lazily-served form schema from the action endpoint while `enabled`,
 * so it can be prefilled per record. Returns null until it arrives.
 */
export function useLazyActionForm(
  endpoint: string,
  method: string,
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

    void fetch(endpoint, {
      body: JSON.stringify({ _form: true }),
      credentials: "same-origin",
      headers: jsonHeaders(componentRef),
      method: method.toUpperCase(),
      signal: controller.signal,
    })
      .then((response) => (response.ok ? (response.json() as Promise<Node>) : null))
      .then((fetched) => setNode(fetched))
      .catch(() => {});

    return () => controller.abort();
  }, [enabled, endpoint, method, componentRef]);

  return node;
}

function firstErrors(errors: Record<string, string[] | string> | undefined): FieldErrors {
  const result: FieldErrors = {};

  for (const [key, value] of Object.entries(errors ?? {})) {
    result[key] = Array.isArray(value) ? value[0] : value;
  }

  return result;
}

function ActionFormSkeleton() {
  return (
    <div className="space-y-4" data-lattice-action-form-loading>
      <div className="h-4 w-24 animate-pulse rounded bg-lt-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-lt-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-lt-muted" />
    </div>
  );
}

type CollectedFields = {
  labels: Record<string, string>;
  values: Record<string, unknown>;
};

function collectFields(formNode: Node): CollectedFields {
  const labels: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  walkFields(formNode.schema, (props) => {
    if (!props.name) {
      return;
    }
    if (props.label) {
      labels[props.name] = props.label;
    }
    if (props.value !== undefined) {
      values[props.name] = props.value;
    }
  });

  return {
    labels,
    values: { ...values, ...(formNode.props?.state as Record<string, unknown> | undefined) },
  };
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
  const { fallback, missingComponent, registry } = useRendererContext();
  const values = useFormValues();
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const extraDataRef = useRef(extraData);
  extraDataRef.current = extraData;
  const resolvedNodes = useFormResolver(endpoint, componentRef, formNode.schema);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [processing, setProcessing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const request = useCallback(
    (extraHeaders?: Record<string, string>): Promise<Response> =>
      fetch(endpoint, {
        body: JSON.stringify({ ...valuesRef.current, ...extraDataRef.current }),
        credentials: "same-origin",
        // fetch only upper-cases the standardized methods, leaving PATCH/DELETE as
        // given; some servers reject a lower-case method line, so normalize it.
        method: method.toUpperCase(),
        headers: jsonHeaders(componentRef, extraHeaders),
      }),
    [componentRef, endpoint, method],
  );

  const clearErrors = useCallback((field: string) => {
    setErrors((current) =>
      current[field] === undefined ? current : { ...current, [field]: undefined },
    );
  }, []);

  const validate = useCallback(
    (field: string) => {
      if (!precognitive) {
        return;
      }

      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
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
    },
    [clearErrors, precognitive, request],
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
        <ResolvedNodesProvider nodes={resolvedNodes}>
          <Renderer
            fallback={fallback}
            missingComponent={missingComponent}
            nodes={formNode.schema ?? []}
            registry={registry}
          />
        </ResolvedNodesProvider>

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
  const { labels: fieldLabels, values: initialValues } = useMemo(
    () => collectFields(formNode),
    [formNode],
  );

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

export function ActionForm({ description, formNode, onClose, title, ...rest }: ActionFormProps) {
  const { t } = useT("lattice");

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-lt-overlay" />
        <Dialog.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className="fixed left-1/2 top-1/2 z-50 max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </Dialog.Title>

              {description && (
                <Dialog.Description className="text-sm text-lt-muted-fg">
                  {description}
                </Dialog.Description>
              )}
            </div>

            <Dialog.Close asChild>
              <Button aria-label={t("a11y.close", "Close")} size="icon" variant="ghost">
                <Icon name="x" aria-hidden="true" className="size-lt-icon-md" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-6">
            {formNode ? (
              <ActionFormContent formNode={formNode} onClose={onClose} {...rest} />
            ) : (
              <ActionFormSkeleton />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
