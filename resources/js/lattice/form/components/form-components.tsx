import { Form as InertiaForm } from "@inertiajs/react";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@/lattice/core/props";
import type { LatticeRendererComponent } from "@/lattice/core/types";
import { LatticeFormProvider, useLatticeForm } from "./context";
import { FormFieldFrame } from "./field";
import type { LatticeFormLabelAction, LatticeFormMethod } from "./types";

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    form: {
      action?: string;
      errorBag?: string;
      method?: LatticeFormMethod;
      resetOnError?: boolean | string[];
      resetOnSuccess?: boolean | string[];
      status?: string;
      submitButton?: boolean;
      submitLabel?: string;
    };
    "form.checkbox": {
      label?: string;
      name?: string;
      required?: boolean;
      tabIndex?: number;
    };
    "form.hidden-input": {
      name?: string;
      value?: string;
    };
    "form.password-input": {
      autoComplete?: string;
      autoFocus?: boolean;
      label?: string;
      labelAction?: LatticeFormLabelAction;
      name?: string;
      passwordRules?: string;
      placeholder?: string;
      required?: boolean;
      tabIndex?: number;
    };
    "form.submit-button": {
      label?: string;
      variant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
    };
    "form.text-input": {
      autoComplete?: string;
      autoFocus?: boolean;
      label?: string;
      name?: string;
      placeholder?: string;
      readOnly?: boolean;
      required?: boolean;
      tabIndex?: number;
      type?: "email" | "text";
      value?: string;
    };
  }
}

export const FormComponent: LatticeRendererComponent<"form"> = ({ children, node }) => {
  const props = node.props ?? {};
  const action = props.action ?? "#";
  const errorBag = props.errorBag;
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
      className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border bg-card p-6 shadow-xs"
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

export const TextInputComponent: LatticeRendererComponent<"form.text-input"> = ({ node }) => {
  const { errors } = useLatticeForm();
  const name = getStringProp(node.props, "name");

  return (
    <FormFieldFrame error={errors[name]} label={getStringProp(node.props, "label")} name={name}>
      <Input
        autoComplete={getStringProp(node.props, "autoComplete")}
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        defaultValue={getStringProp(node.props, "value") || undefined}
        id={name}
        name={name}
        placeholder={getStringProp(node.props, "placeholder")}
        readOnly={getBooleanProp(node.props, "readOnly")}
        required={getBooleanProp(node.props, "required")}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        type={getStringProp(node.props, "type", "text")}
      />
    </FormFieldFrame>
  );
};

export const PasswordInputComponent: LatticeRendererComponent<"form.password-input"> = ({
  node,
}) => {
  const { errors } = useLatticeForm();
  const name = getStringProp(node.props, "name");

  return (
    <FormFieldFrame
      error={errors[name]}
      label={getStringProp(node.props, "label")}
      labelAction={node.props?.labelAction}
      name={name}
    >
      <PasswordInput
        autoComplete={getStringProp(node.props, "autoComplete")}
        autoFocus={getBooleanProp(node.props, "autoFocus")}
        id={name}
        name={name}
        placeholder={getStringProp(node.props, "placeholder")}
        passwordrules={getStringProp(node.props, "passwordRules") || undefined}
        required={getBooleanProp(node.props, "required")}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
      />
    </FormFieldFrame>
  );
};

export const HiddenInputComponent: LatticeRendererComponent<"form.hidden-input"> = ({ node }) => (
  <input
    defaultValue={getStringProp(node.props, "value")}
    name={getStringProp(node.props, "name")}
    type="hidden"
  />
);

export const CheckboxComponent: LatticeRendererComponent<"form.checkbox"> = ({ node }) => {
  const name = getStringProp(node.props, "name");

  return (
    <div className="flex items-center space-x-3">
      <Checkbox
        id={name}
        name={name}
        required={getBooleanProp(node.props, "required")}
        tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
      />
      <Label htmlFor={name}>{getStringProp(node.props, "label")}</Label>
    </div>
  );
};

export const SubmitButtonComponent: LatticeRendererComponent<"form.submit-button"> = ({ node }) => {
  const { processing } = useLatticeForm();

  return (
    <Button
      disabled={processing}
      type="submit"
      className="mt-4 w-full"
      variant={node.props?.variant ?? "default"}
    >
      {processing && <Spinner />}
      {getStringProp(node.props, "label", "Submit")}
    </Button>
  );
};
