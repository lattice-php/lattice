import { Form as InertiaForm } from "@inertiajs/react";
import { withRefHeader } from "@lattice/lattice/core/component-ref";
import { getStringProp } from "@lattice/lattice/core/props";
import { LATTICE_EVENT } from "@lattice/lattice/events/event-names";
import type { Node, NodeProps, RendererComponent } from "@lattice/lattice/core/types";
import { useEffect, useMemo } from "react";
import { FormSubmitButton } from "./base/submit-button";
import { FormProvider } from "./context";
import { ResolvedNodesProvider } from "./resolved-nodes";
import type { Form } from "./types";
import { useFormResolver } from "./use-form-resolver";
import { FormValuesProvider } from "./values";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    form: Form;
  }
}

function getFormState(props: NodeProps | undefined): Record<string, unknown> {
  const state = props?.state;

  if (typeof state !== "object" || state === null || Array.isArray(state)) {
    return {};
  }

  return state as Record<string, unknown>;
}

type CollectedFields = {
  labels: Record<string, string>;
  values: Record<string, unknown>;
};

function collectFields(
  nodes: Node[] | undefined,
  collected: CollectedFields = { labels: {}, values: {} },
): CollectedFields {
  for (const child of nodes ?? []) {
    const name = getStringProp(child.props, "name");

    if (name) {
      const label = getStringProp(child.props, "label");
      if (label) {
        collected.labels[name] = label;
      }
      if (child.props?.value !== undefined) {
        collected.values[name] = child.props.value;
      }
    }

    collectFields(child.schema, collected);
  }

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
      const detail = (event as CustomEvent<{ form?: string }>).detail;

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
  const props = node.props ?? {};
  const action = props.action ?? "#";
  const errorBag = props.errorBag;
  const componentRef = props.ref ?? "";
  const method = props.method ?? "post";
  const precognitive = props.precognitive ?? false;
  const resetOnError = props.resetOnError ?? false;
  const resetOnSuccess = props.resetOnSuccess ?? [];
  const state = getFormState(node.props);
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
      {({
        clearErrors,
        errors,
        invalid,
        processing,
        reset,
        touch,
        validate,
        validating,
        valid,
      }) => (
        <FormProvider
          value={{
            action,
            clearErrors: (field) => clearErrors(field),
            componentRef,
            errors: errors as Record<string, string | undefined>,
            fieldLabels,
            invalid: (field) => invalid(field),
            precognitive,
            processing,
            touch: (field) => touch(field),
            validate: (field) => validate(field),
            validating,
            valid: (field) => valid(field),
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
