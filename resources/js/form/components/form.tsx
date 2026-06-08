import type { FormDataConvertible } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@lattice/core/props";
import type { Node, NodeProps, RendererComponent } from "@lattice/core/types";
import { useEffect } from "react";
import { FormSubmitButton } from "./base/submit-button";
import { FormProvider } from "./context";
import type { FormMethod } from "./types";
import { FormValuesProvider } from "./values";

declare module "@lattice/core/types" {
  interface ComponentProps {
    form: {
      action?: string;
      errorBag?: string;
      ref?: string;
      method?: FormMethod;
      precognitive?: boolean;
      resetOnError?: boolean | string[];
      resetOnSuccess?: boolean | string[];
      state?: Record<string, unknown>;
      status?: string;
      submitButton?: boolean;
      submitLabel?: string;
      validationTimeout?: number;
    };
  }
}

function getFormState(props: NodeProps | undefined): Record<string, unknown> {
  const state = props?.state;

  if (typeof state !== "object" || state === null || Array.isArray(state)) {
    return {};
  }

  return state as Record<string, unknown>;
}

function collectFieldLabels(
  nodes: Node[] | undefined,
  labels: Record<string, string> = {},
): Record<string, string> {
  for (const child of nodes ?? []) {
    const name = getStringProp(child.props, "name");
    const label = getStringProp(child.props, "label");

    if (name && label) {
      labels[name] = label;
    }

    collectFieldLabels(child.children, labels);
  }

  return labels;
}

function collectFieldValues(
  nodes: Node[] | undefined,
  values: Record<string, unknown> = {},
): Record<string, unknown> {
  for (const child of nodes ?? []) {
    const name = getStringProp(child.props, "name");
    const value = child.props?.value;

    if (name && value !== undefined) {
      values[name] = value;
    }

    collectFieldValues(child.children, values);
  }

  return values;
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

    window.addEventListener("lattice:reset-form", handler);

    return () => window.removeEventListener("lattice:reset-form", handler);
  }, [componentId, reset]);

  return null;
}

export const FormComponent: RendererComponent<"form"> = ({ children, node }) => {
  const props = node.props ?? {};
  const action = props.action ?? "#";
  const errorBag = props.errorBag;
  const componentRef = getStringProp(props, "ref");
  const method = props.method ?? "post";
  const precognitive = getBooleanProp(props, "precognitive");
  const resetOnError = props.resetOnError ?? false;
  const resetOnSuccess = props.resetOnSuccess ?? [];
  const state = getFormState(node.props);
  const initialValues = { ...collectFieldValues(node.children), ...state };
  const fieldLabels = collectFieldLabels(node.children);
  const shouldRenderSubmitButton = getBooleanProp(props, "submitButton", true);
  const submitLabel = props.submitLabel ?? "Submit";
  const validationTimeout = getOptionalNumberProp(props, "validationTimeout");

  return (
    <InertiaForm
      action={action}
      data-lattice-component={node.id}
      errorBag={errorBag}
      method={method}
      resetOnError={resetOnError}
      resetOnSuccess={resetOnSuccess}
      validationTimeout={precognitive ? validationTimeout : undefined}
      transform={(data) => ({
        ...data,
        ...(componentRef
          ? ({ _lattice: componentRef } satisfies Record<string, FormDataConvertible>)
          : {}),
      })}
      className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface p-6 shadow-xs"
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
            clearErrors: (field) => clearErrors(field),
            errors: errors as Record<string, string | undefined>,
            fieldLabels,
            invalid: (field) => invalid(field),
            precognitive,
            processing,
            state,
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
            <div className="grid gap-6">
              {children}

              {shouldRenderSubmitButton && <FormSubmitButton label={submitLabel} />}
            </div>
          </FormValuesProvider>
        </FormProvider>
      )}
    </InertiaForm>
  );
};
