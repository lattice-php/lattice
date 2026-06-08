import type { FormDataConvertible } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { Button } from "@/lattice/core/components/button";
import { Spinner } from "@/lattice/core/components/spinner";
import { getBooleanProp, getStringProp } from "@/lattice/core/props";
import type { RendererComponent } from "@/lattice/core/types";
import { LatticeFormProvider } from "./context";
import type { FormMethod } from "./types";

declare module "@/lattice/core/types" {
  interface ComponentProps {
    form: {
      action?: string;
      errorBag?: string;
      ref?: string;
      method?: FormMethod;
      resetOnError?: boolean | string[];
      resetOnSuccess?: boolean | string[];
      status?: string;
      submitButton?: boolean;
      submitLabel?: string;
    };
  }
}

export const FormComponent: RendererComponent<"form"> = ({ children, node }) => {
  const props = node.props ?? {};
  const action = props.action ?? "#";
  const errorBag = props.errorBag;
  const componentRef = getStringProp(props, "ref");
  const method = props.method ?? "post";
  const resetOnError = props.resetOnError ?? false;
  const resetOnSuccess = props.resetOnSuccess ?? [];
  const shouldRenderSubmitButton = getBooleanProp(props, "submitButton", true);
  const submitLabel = props.submitLabel ?? "Submit";

  return (
    <InertiaForm
      action={action}
      data-lattice-component={node.id}
      errorBag={errorBag}
      method={method}
      resetOnError={resetOnError}
      resetOnSuccess={resetOnSuccess}
      transform={(data) => ({
        ...data,
        ...(componentRef
          ? ({ _lattice: componentRef } satisfies Record<string, FormDataConvertible>)
          : {}),
      })}
      className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface p-6 shadow-xs"
    >
      {({ errors, processing }) => (
        <LatticeFormProvider
          value={{
            errors: errors as Record<string, string | undefined>,
            processing,
          }}
        >
          {props.status && (
            <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">
              {props.status}
            </div>
          )}

          <div className="grid gap-6">
            {children}

            {shouldRenderSubmitButton && (
              <Button disabled={processing} type="submit" className="mt-4 w-full">
                {processing && <Spinner />}
                {submitLabel}
              </Button>
            )}
          </div>
        </LatticeFormProvider>
      )}
    </InertiaForm>
  );
};
