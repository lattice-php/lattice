import { Form as InertiaForm } from "@inertiajs/react";
import { withHeaders } from "@lattice-php/lattice/core/headers";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { useWindowEvent } from "@lattice-php/lattice/core/hooks/use-window-event";
import { nodeKey } from "@lattice-php/lattice/core/nodes";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import type { ButtonVariant, Justify } from "@lattice-php/lattice/types/generated";
import { useMemo } from "react";
import { FormSubmitButton } from "./base/submit-button";
import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { collectFields } from "@lattice-php/lattice/form/lib/collect-fields";
import { PrefillProvider } from "@lattice-php/lattice/form/hooks/prefill-context";
import { ResolvedNodesProvider } from "@lattice-php/lattice/form/hooks/resolved-nodes";
import { useFormResolver } from "@lattice-php/lattice/form/hooks/use-form-resolver";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";

const JUSTIFY_CLASS: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

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
  submitButtons,
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
  submitButtons: Node<"button">[] | undefined;
  submitJustify: Justify | undefined;
  submitLabel: string;
  submitVariant: ButtonVariant | undefined;
  summaryLabel: string;
}) {
  const { nodes: resolvedNodes, markUserEdit } = useFormResolver(action, componentRef, nodes);

  return (
    <PrefillProvider value={{ markUserEdit }}>
      <ResolvedNodesProvider nodes={resolvedNodes}>
        <div className="flex flex-col gap-6">
          {children}

          {shouldRenderSubmitButton && (
            <div className={`flex gap-3 ${JUSTIFY_CLASS[submitJustify ?? "end"]}`}>
              {submitButtons?.length ? (
                submitButtons.map((button, index) =>
                  button.props.buttonType === "submit" ? (
                    <FormSubmitButton
                      key={nodeKey(button, index)}
                      label={button.props.label ?? submitLabel}
                      summaryLabel={summaryLabel}
                      variant={button.props.variant ?? submitVariant ?? "default"}
                    />
                  ) : (
                    <RenderNode key={nodeKey(button, index)} node={button} />
                  ),
                )
              ) : (
                <FormSubmitButton
                  label={submitLabel}
                  summaryLabel={summaryLabel}
                  variant={submitVariant ?? "default"}
                />
              )}
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
  const submitButtons = props.submitButtons ?? undefined;
  const submitJustify = props.submitJustify ?? undefined;
  const submitLabel = props.submitLabel ?? t("form.submit", "Submit");
  const submitVariant = props.submitVariant ?? undefined;
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

          <FormValuesProvider initial={initialValues}>
            <FormBody
              action={action}
              componentRef={componentRef}
              nodes={node.schema}
              shouldRenderSubmitButton={shouldRenderSubmitButton}
              submitButtons={submitButtons}
              submitJustify={submitJustify}
              submitLabel={submitLabel}
              submitVariant={submitVariant}
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
