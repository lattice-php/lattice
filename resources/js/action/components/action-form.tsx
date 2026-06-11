import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { withRefHeader } from "@lattice/lattice/core/component-ref";
import { Button } from "@lattice/lattice/core/components/button";
import { Spinner } from "@lattice/lattice/core/components/spinner";
import { Renderer, useRendererContext } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import { FormProvider } from "@lattice/lattice/form/components/context";
import { walkFields } from "@lattice/lattice/form/components/field-props";
import { FORM_DEBOUNCE_MS, xsrfToken } from "@lattice/lattice/form/components/form-transport";
import { FormValuesProvider, useFormValues } from "@lattice/lattice/form/components/values";
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
  formNode: Node;
  method: string;
  onClose: () => void;
  onSuccess: (response: ActionResponse) => void;
  submitLabel: string;
  title: string;
};

function firstErrors(errors: Record<string, string[] | string> | undefined): FieldErrors {
  const result: FieldErrors = {};

  for (const [key, value] of Object.entries(errors ?? {})) {
    result[key] = Array.isArray(value) ? value[0] : value;
  }

  return result;
}

function collectInitialValues(formNode: Node): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  walkFields(formNode.schema, (props) => {
    if (props.name && props.value !== undefined) {
      values[props.name] = props.value;
    }
  });

  return { ...values, ...(formNode.props?.state as Record<string, unknown> | undefined) };
}

function collectLabels(formNode: Node): Record<string, string> {
  const labels: Record<string, string> = {};

  walkFields(formNode.schema, (props) => {
    if (props.name && props.label) {
      labels[props.name] = props.label;
    }
  });

  return labels;
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
  precognitive: boolean;
}) {
  const { fallback, missingComponent, registry } = useRendererContext();
  const values = useFormValues();
  // fetch only upper-cases the standardized methods, leaving PATCH/DELETE as
  // given; some servers reject a lower-case method line, so normalize it here.
  const httpMethod = method.toUpperCase();
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const extraDataRef = useRef(extraData);
  extraDataRef.current = extraData;

  const requestBody = useCallback(
    () => JSON.stringify({ ...valuesRef.current, ...extraDataRef.current }),
    [],
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [processing, setProcessing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const headers = useCallback(
    (extra: Record<string, string> = {}): Record<string, string> => ({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-XSRF-TOKEN": xsrfToken(),
      ...withRefHeader(componentRef),
      ...extra,
    }),
    [componentRef],
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
        void fetch(endpoint, {
          body: requestBody(),
          credentials: "same-origin",
          headers: headers({ Precognition: "true", "Precognition-Validate-Only": field }),
          method: httpMethod,
        })
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
    [clearErrors, endpoint, headers, httpMethod, precognitive, requestBody],
  );

  const submit = useCallback(() => {
    setProcessing(true);

    void fetch(endpoint, {
      body: requestBody(),
      credentials: "same-origin",
      headers: headers(),
      method: httpMethod,
    })
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
  }, [endpoint, headers, httpMethod, onSuccess, requestBody]);

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
        <Renderer
          fallback={fallback}
          missingComponent={missingComponent}
          nodes={formNode.schema ?? []}
          registry={registry}
        />

        <div className="flex justify-end gap-3">
          <Button disabled={processing} onClick={onClose} type="button" variant="ghost">
            {cancelLabel}
          </Button>

          <Button disabled={processing} type="submit">
            {processing && <Spinner />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function ActionForm({ description, formNode, onClose, title, ...rest }: ActionFormProps) {
  const precognitive = Boolean(formNode.props?.precognitive);
  const fieldLabels = useMemo(() => collectLabels(formNode), [formNode]);
  const initialValues = useMemo(() => collectInitialValues(formNode), [formNode]);

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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
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
              <Button aria-label="Close" size="icon" variant="ghost">
                <X aria-hidden="true" className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-6">
            <FormValuesProvider initial={initialValues}>
              <ActionFormBody
                fieldLabels={fieldLabels}
                formNode={formNode}
                onClose={onClose}
                precognitive={precognitive}
                {...rest}
              />
            </FormValuesProvider>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
