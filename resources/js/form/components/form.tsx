import { Form as InertiaForm } from "@inertiajs/react";
import { withHeaders } from "@lattice-php/lattice/core/headers";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { useWindowEvent } from "@lattice-php/lattice/core/hooks/use-window-event";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { useMemo } from "react";
import { FormSubmitButton } from "./base/submit-button";
import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { collectFields } from "@lattice-php/lattice/form/lib/collect-fields";
import { PrefillProvider } from "@lattice-php/lattice/form/hooks/prefill-context";
import { ResolvedNodesProvider } from "@lattice-php/lattice/form/hooks/resolved-nodes";
import { useFormResolver } from "@lattice-php/lattice/form/hooks/use-form-resolver";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";

function FormResetListener({
  componentId,
  reset,
}: {
  componentId?: string;
  reset: (...fields: string[]) => void;
}) {
  useWindowEvent(LATTICE_EVENT.resetForm, (event) => {
    const detail = (event as CustomEvent<{ form: string | null }>).detail;

    if (!detail?.form || detail.form === componentId) {
      reset();
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
  submitLabel,
  summaryLabel,
}: {
  action: string;
  children: React.ReactNode;
  componentRef: string;
  nodes: Node[] | undefined;
  shouldRenderSubmitButton: boolean;
  submitLabel: string;
  summaryLabel: string;
}) {
  const { nodes: resolvedNodes, markUserEdit } = useFormResolver(action, componentRef, nodes);

  return (
    <PrefillProvider value={{ markUserEdit }}>
      <ResolvedNodesProvider nodes={resolvedNodes}>
        <div className="flex flex-col gap-6">
          {children}

          {shouldRenderSubmitButton && (
            <div className="flex justify-end rounded-lt border border-lt-border bg-lt-surface px-lt-gutter py-4 shadow-lt-sm">
              <FormSubmitButton label={submitLabel} summaryLabel={summaryLabel} />
            </div>
          )}
        </div>
      </ResolvedNodesProvider>
    </PrefillProvider>
  );
}

export const FormComponent: RendererComponent<"form"> = ({ children, node }) => {
  const { t } = useT("lattice");
  const props = node.props;
  const action = props.action ?? "#";
  const errorBag = props.errorBag;
  const componentRef = props.ref ?? "";
  const method = props.method ?? "post";
  const precognitive = props.precognitive;
  const resetOnError = props.resetOnError ?? false;
  const resetOnSuccess = props.resetOnSuccess ?? [];
  const state = props.state;
  const { labels: fieldLabels, values: fieldValues } = useMemo(
    () => collectFields(node.schema),
    [node.schema],
  );
  const initialValues = useMemo(() => ({ ...fieldValues, ...state }), [fieldValues, state]);
  const shouldRenderSubmitButton = props.submitButton;
  const submitLabel = props.submitLabel ?? t("form.submit", "Submit");
  const summaryLabel = props.validationSummaryLabel;
  const validationTimeout = props.validationTimeout ?? undefined;

  return (
    <InertiaForm
      action={action}
      data-slot="form"
      data-lattice-component={node.id}
      errorBag={errorBag}
      method={method}
      resetOnError={resetOnError}
      resetOnSuccess={resetOnSuccess}
      validationTimeout={precognitive ? validationTimeout : undefined}
      headers={withHeaders(componentRef)}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6"
    >
      {({ clearErrors, errors, processing, reset, validate }) => (
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
            validate: (field) => validate(field),
          }}
        >
          <FormResetListener componentId={node.id} reset={reset} />

          {props.status && (
            <div className="text-center text-sm font-medium text-lt-success">{props.status}</div>
          )}

          <FormValuesProvider initial={initialValues}>
            <FormBody
              action={action}
              componentRef={componentRef}
              nodes={node.schema}
              shouldRenderSubmitButton={shouldRenderSubmitButton}
              submitLabel={submitLabel}
              summaryLabel={summaryLabel}
            >
              {children}
            </FormBody>
          </FormValuesProvider>
        </FormProvider>
      )}
    </InertiaForm>
  );
};
