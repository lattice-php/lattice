import { Form as InertiaForm } from "@inertiajs/react";
import { withRefHeader } from "@lattice/lattice/core/component-ref";
import { LATTICE_EVENT } from "@lattice/lattice/events/event-names";
import type { Node, RendererComponent } from "@lattice/lattice/core/types";
import { useEffect, useMemo } from "react";
import { FormSubmitButton } from "./base/submit-button";
import { FormProvider } from "./context";
import { walkFields } from "./field-props";
import { ResolvedNodesProvider } from "./resolved-nodes";
import { useFormResolver } from "./use-form-resolver";
import { FormValuesProvider } from "./values";

type CollectedFields = {
  labels: Record<string, string>;
  values: Record<string, unknown>;
};

function collectFields(nodes: Node[] | undefined): CollectedFields {
  const collected: CollectedFields = { labels: {}, values: {} };

  walkFields(nodes, (props) => {
    if (!props.name) {
      return;
    }
    if (props.label) {
      collected.labels[props.name] = props.label;
    }
    if (props.value !== undefined) {
      collected.values[props.name] = props.value;
    }
  });

  return collected;
}

function FormResetListener({
  componentId,
  reset,
}: {
  componentId?: string;
  reset: (...fields: string[]) => void;
}) {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ form: string | null }>).detail;

      if (!detail?.form || detail.form === componentId) {
        reset();
      }
    };

    window.addEventListener(LATTICE_EVENT.resetForm, handler);

    return () => window.removeEventListener(LATTICE_EVENT.resetForm, handler);
  }, [componentId, reset]);

  return null;
}

function FormBody({
  action,
  children,
  componentRef,
  nodes,
  shouldRenderSubmitButton,
  submitLabel,
}: {
  action: string;
  children: React.ReactNode;
  componentRef: string;
  nodes: Node[] | undefined;
  shouldRenderSubmitButton: boolean;
  submitLabel: string;
}) {
  const resolvedNodes = useFormResolver(action, componentRef, nodes);

  return (
    <ResolvedNodesProvider nodes={resolvedNodes}>
      <div className="flex flex-col gap-6">
        {children}

        {shouldRenderSubmitButton && (
          <div className="flex justify-end rounded-lt border border-lt-border bg-lt-surface px-6 py-4 shadow-xs">
            <FormSubmitButton label={submitLabel} />
          </div>
        )}
      </div>
    </ResolvedNodesProvider>
  );
}

export const FormComponent: RendererComponent<"form"> = ({ children, node }) => {
  const props = node.props;
  const action = props.action ?? "#";
  const errorBag = props.errorBag;
  const componentRef = props.ref ?? "";
  const method = props.method ?? "post";
  const precognitive = props.precognitive ?? false;
  const resetOnError = props.resetOnError ?? false;
  const resetOnSuccess = props.resetOnSuccess ?? [];
  const state = props.state;
  const { labels: fieldLabels, values: fieldValues } = useMemo(
    () => collectFields(node.schema),
    [node.schema],
  );
  const initialValues = { ...fieldValues, ...state };
  const shouldRenderSubmitButton = props.submitButton ?? true;
  const submitLabel = props.submitLabel ?? "Submit";
  const validationTimeout = props.validationTimeout ?? undefined;

  return (
    <InertiaForm
      action={action}
      data-lattice-component={node.id}
      errorBag={errorBag}
      method={method}
      resetOnError={resetOnError}
      resetOnSuccess={resetOnSuccess}
      validationTimeout={precognitive ? validationTimeout : undefined}
      headers={withRefHeader(componentRef)}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6"
    >
      {({ clearErrors, errors, processing, reset, validate }) => (
        <FormProvider
          value={{
            action,
            clearErrors: (field) => clearErrors(field),
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
            <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">
              {props.status}
            </div>
          )}

          <FormValuesProvider initial={initialValues}>
            <FormBody
              action={action}
              componentRef={componentRef}
              nodes={node.schema}
              shouldRenderSubmitButton={shouldRenderSubmitButton}
              submitLabel={submitLabel}
            >
              {children}
            </FormBody>
          </FormValuesProvider>
        </FormProvider>
      )}
    </InertiaForm>
  );
};
