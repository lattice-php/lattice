import type { FormComponentRef, HttpExceptionResponse } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { refreshRef } from "@lattice-php/core/api";
import { withHeaders } from "@lattice-php/core/headers";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
import { nodeKey } from "@lattice-php/core/nodes";
import { RenderNode } from "@lattice-php/core/renderer";
import type { Node, RendererComponent } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import type { Emphasis, Justify, Variant } from "@lattice-php/ui";
import { justifyClasses } from "@lattice-php/ui/lib/justify";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormSubmitButton } from "../base/submit-button";
import { FormProvider } from "../../hooks/context";
import { collectFields } from "../../lib/collect-fields";
import { PrefillProvider } from "../../hooks/prefill-context";
import { ResolvedNodesProvider } from "../../hooks/resolved-nodes";
import { useFormResolver } from "../../hooks/use-form-resolver";
import { useFetchForm } from "../../hooks/use-fetch-form";
import { FormValuesProvider, useResetFormValues } from "../../hooks/values";

type SubmitButtonNode = Node & {
  props: {
    buttonType: string;
    emphasis?: Emphasis | null;
    label?: string | null;
    variant?: Variant | null;
  };
};

function FormResetListener({
  componentId,
  reset,
}: {
  componentId?: string;
  reset: (...fields: string[]) => void;
}) {
  const resetValues = useResetFormValues();

  useWindowEvent(LATTICE_EVENT.resetForm, (event) => {
    const detail = (event as CustomEvent<{ form: string | null }>).detail;

    if (!detail?.form || detail.form === componentId) {
      reset();
      resetValues();
    }
  });

  return null;
}

function FormBody({
  action,
  children,
  componentRef,
  nodes,
  shouldRenderSubmitButton,
  submitButtons,
  submitEmphasis,
  submitJustify,
  submitLabel,
  submitVariant,
  summaryLabel,
}: {
  action: string;
  children: React.ReactNode;
  componentRef: string;
  nodes: Node[] | undefined;
  shouldRenderSubmitButton: boolean;
  submitButtons: SubmitButtonNode[] | undefined;
  submitEmphasis: Emphasis | undefined;
  submitJustify: Justify | undefined;
  submitLabel: string;
  submitVariant: Variant | undefined;
  summaryLabel: string;
}) {
  const { nodes: resolvedNodes, markUserEdit } = useFormResolver(action, componentRef, nodes);
  const prefill = useMemo(() => ({ markUserEdit }), [markUserEdit]);

  return (
    <PrefillProvider value={prefill}>
      <ResolvedNodesProvider nodes={resolvedNodes}>
        <div className="flex flex-col gap-6">
          {children}

          {shouldRenderSubmitButton && (
            <div className={`flex gap-3 ${justifyClasses[submitJustify ?? "end"]}`}>
              {submitButtons?.length ? (
                submitButtons.map((button, index) =>
                  button.props.buttonType === "submit" ? (
                    <FormSubmitButton
                      key={nodeKey(button, index)}
                      emphasis={button.props.emphasis ?? submitEmphasis}
                      label={button.props.label ?? submitLabel}
                      summaryLabel={summaryLabel}
                      variant={button.props.variant ?? submitVariant}
                    />
                  ) : (
                    <RenderNode key={nodeKey(button, index)} node={button} />
                  ),
                )
              ) : (
                <FormSubmitButton
                  emphasis={submitEmphasis}
                  label={submitLabel}
                  summaryLabel={summaryLabel}
                  variant={submitVariant}
                />
              )}
            </div>
          )}
        </div>
      </ResolvedNodesProvider>
    </PrefillProvider>
  );
}

function configuredResetFields(
  configured: string[] | boolean | null | undefined,
): string[] | undefined | false {
  if (!configured || (Array.isArray(configured) && configured.length === 0)) {
    return false;
  }

  return Array.isArray(configured) ? configured : undefined;
}

export const FormAdapter: RendererComponent<"form"> = ({ children, node }) => {
  const initialValues = useMemo(
    () => ({ ...collectFields(node.schema).values, ...node.props.state }),
    [node.schema, node.props.state],
  );

  const Shell = node.props.async ? AsyncFormShell : FormShell;

  return (
    <FormValuesProvider initial={initialValues}>
      <Shell node={node}>{children}</Shell>
    </FormValuesProvider>
  );
};

/**
 * The fetch-based shell for `Form::async()`: submits as JSON and applies the
 * response's effects in place — no Inertia visit, no page re-render. Error
 * bags don't exist here; 422 bodies map straight onto field errors, and ref
 * renewal on 403 lives inside apiFetch.
 */
function AsyncFormShell({ children, node }: { children: React.ReactNode; node: Node<"form"> }) {
  const { t } = useT("lattice");
  const props = node.props;
  const action = props.action ?? "#";
  const componentRef = props.ref ?? "";
  const method = props.method ?? "post";
  const precognitive = props.precognitive;
  const resetOnError = props.resetOnError ?? false;
  const resetOnSuccess = props.resetOnSuccess ?? [];
  const fieldLabels = useMemo(() => collectFields(node.schema).labels, [node.schema]);
  const submitButtons = (props.submitButtons as SubmitButtonNode[] | null) ?? undefined;
  const submitLabel = props.submitLabel ?? t("form.submit", "Submit");

  const resetValues = useResetFormValues();
  const resetConfigured = (configured: string[] | boolean | null | undefined): void => {
    const fields = configuredResetFields(configured);

    if (fields !== false) {
      resetValues(fields);
    }
  };

  const { clearErrors, errors, processing, submit, touch, validate, validateFields, validating } =
    useFetchForm({
      componentRef,
      endpoint: action,
      method,
      onError: () => resetConfigured(resetOnError),
      onSuccess: () => resetConfigured(resetOnSuccess),
      precognitive,
      validationDebounceMs: props.validationTimeout ?? undefined,
    });

  const context = useMemo(
    () => ({
      action,
      clearErrors,
      componentId: node.id,
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
      action,
      clearErrors,
      componentRef,
      errors,
      fieldLabels,
      node.id,
      precognitive,
      processing,
      touch,
      validate,
      validateFields,
      validating,
    ],
  );

  return (
    <form
      data-slot="form"
      data-test={node.id}
      className="flex w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <FormProvider value={context}>
        <FormResetListener componentId={node.id} reset={() => {}} />

        {props.status && (
          <div className="text-center text-sm font-medium text-lt-success">{props.status}</div>
        )}

        <FormBody
          action={action}
          componentRef={componentRef}
          nodes={node.schema}
          shouldRenderSubmitButton={props.submitButton}
          submitButtons={submitButtons}
          submitEmphasis={props.submitEmphasis ?? undefined}
          submitJustify={props.submitJustify ?? undefined}
          submitLabel={submitLabel}
          submitVariant={props.submitVariant ?? undefined}
          summaryLabel={props.validationSummaryLabel}
        >
          {children}
        </FormBody>
      </FormProvider>
    </form>
  );
}

function FormShell({ children, node }: { children: React.ReactNode; node: Node<"form"> }) {
  const { t } = useT("lattice");
  const props = node.props;
  const action = props.action ?? "#";
  const errorBag = props.errorBag;
  const componentRef = props.ref ?? "";
  const method = props.method ?? "post";
  const precognitive = props.precognitive;
  const resetOnError = props.resetOnError ?? false;
  const resetOnSuccess = props.resetOnSuccess ?? [];
  const fieldLabels = useMemo(() => collectFields(node.schema).labels, [node.schema]);
  const shouldRenderSubmitButton = props.submitButton;
  const submitButtons = (props.submitButtons as SubmitButtonNode[] | null) ?? undefined;
  const submitJustify = props.submitJustify ?? undefined;
  const submitLabel = props.submitLabel ?? t("form.submit", "Submit");
  const submitVariant = props.submitVariant ?? undefined;
  const submitEmphasis = props.submitEmphasis ?? undefined;
  const summaryLabel = props.validationSummaryLabel;
  const validationTimeout = props.validationTimeout ?? undefined;

  const resetValues = useResetFormValues();
  const resetConfigured = (configured: string[] | boolean | null | undefined): void => {
    const fields = configuredResetFields(configured);

    if (fields !== false) {
      resetValues(fields);
    }
  };

  const formRef = useRef<FormComponentRef | null>(null);
  // One renewal attempt per user-initiated submit: 'renewing' marks the window
  // between the 403 and our programmatic retry, 'retried' lets the second
  // failure surface normally.
  const retryPhase = useRef<"idle" | "renewing" | "retried">("idle");
  const [renewedSubmitTick, setRenewedSubmitTick] = useState(0);

  useEffect(() => {
    // The state bump forces this render first, so the headers prop below has
    // re-resolved the renewed token before the retry goes out.
    if (renewedSubmitTick > 0 && retryPhase.current === "renewing") {
      formRef.current?.submit();
    }
  }, [renewedSubmitTick]);

  return (
    <InertiaForm
      ref={formRef}
      action={action}
      data-slot="form"
      data-test={node.id}
      errorBag={errorBag}
      method={method}
      options={{ preserveScroll: true }}
      resetOnError={resetOnError}
      resetOnSuccess={resetOnSuccess}
      validationTimeout={precognitive ? validationTimeout : undefined}
      headers={withHeaders(componentRef)}
      className="flex w-full flex-col gap-6"
      onStart={() => {
        retryPhase.current = retryPhase.current === "renewing" ? "retried" : "idle";
      }}
      onSuccess={() => resetConfigured(resetOnSuccess)}
      onError={() => resetConfigured(resetOnError)}
      onHttpException={(response: HttpExceptionResponse) => {
        if (response.status !== 403 || componentRef === "" || retryPhase.current === "retried") {
          return undefined;
        }

        retryPhase.current = "renewing";
        // Retry even when the renewal failed: a genuine 403 then surfaces
        // through the second attempt instead of being swallowed here.
        void refreshRef(componentRef).finally(() => setRenewedSubmitTick((tick) => tick + 1));

        return false;
      }}
    >
      {({ clearErrors, errors, processing, reset, touch, validate, validating }) => (
        <FormProvider
          value={{
            action,
            clearErrors: (field) => clearErrors(field),
            componentId: node.id,
            componentRef,
            errors: errors as Record<string, string | undefined>,
            fieldLabels,
            precognitive,
            processing,
            touch: (fields) => touch(...fields),
            validate: (field) => validate(field),
            validateFields: (fields, options) => validate({ only: fields, ...options }),
            validating,
          }}
        >
          <FormResetListener componentId={node.id} reset={reset} />

          {props.status && (
            <div className="text-center text-sm font-medium text-lt-success">{props.status}</div>
          )}

          <FormBody
            action={action}
            componentRef={componentRef}
            nodes={node.schema}
            shouldRenderSubmitButton={shouldRenderSubmitButton}
            submitButtons={submitButtons}
            submitEmphasis={submitEmphasis}
            submitJustify={submitJustify}
            submitLabel={submitLabel}
            submitVariant={submitVariant}
            summaryLabel={summaryLabel}
          >
            {children}
          </FormBody>
        </FormProvider>
      )}
    </InertiaForm>
  );
}
