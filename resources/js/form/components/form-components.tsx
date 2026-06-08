import { Form as InertiaForm } from "@inertiajs/react";
import type { FormDataConvertible } from "@inertiajs/core";
import { useEffect, useMemo, useState } from "react";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { getBooleanProp, getOptionalNumberProp, getStringProp } from "@/lattice/core/props";
import type { LatticeNodeProps, LatticeRendererComponent } from "@/lattice/core/types";
import { LatticeFormProvider, useLatticeForm } from "./context";
import { FormFieldFrame } from "./field";
import type { LatticeFormLabelAction, LatticeFormMethod } from "./types";

type ChoiceOption = {
  label: string;
  value: string;
};

type PasswordConfirmation = {
  label?: string;
  name?: string;
  placeholder?: string;
};

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    form: {
      action?: string;
      errorBag?: string;
      ref?: string;
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
    "form.choice": {
      event?: string;
      label?: string;
      name?: string;
      options?: ChoiceOption[];
      tabIndex?: number;
      value?: string;
    };
    "form.hidden-input": {
      name?: string;
      value?: string;
    };
    "form.password-input": {
      autoComplete?: string;
      autoFocus?: boolean;
      confirmation?: PasswordConfirmation;
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

function getChoiceOptions(props: LatticeNodeProps | undefined): ChoiceOption[] {
  const value = props?.options;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (option): option is ChoiceOption =>
      typeof option === "object" &&
      option !== null &&
      typeof option.label === "string" &&
      typeof option.value === "string",
  );
}

function getPasswordConfirmation(
  props: LatticeNodeProps | undefined,
): PasswordConfirmation | undefined {
  const value = props?.confirmation;

  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const confirmation = value as Record<string, unknown>;

  return {
    label: typeof confirmation.label === "string" ? confirmation.label : undefined,
    name: typeof confirmation.name === "string" ? confirmation.name : undefined,
    placeholder:
      typeof confirmation.placeholder === "string" ? confirmation.placeholder : undefined,
  };
}

export const FormComponent: LatticeRendererComponent<"form"> = ({ children, node }) => {
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
  const confirmation = getPasswordConfirmation(node.props);
  const confirmationName = confirmation?.name ?? `${name}_confirmation`;
  const passwordRules = getStringProp(node.props, "passwordRules") || undefined;

  return (
    <div className="grid gap-6">
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
          passwordrules={passwordRules}
          required={getBooleanProp(node.props, "required")}
          tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
        />
      </FormFieldFrame>

      {confirmation && (
        <FormFieldFrame
          error={errors[confirmationName]}
          label={confirmation.label ?? "Confirm password"}
          name={confirmationName}
        >
          <PasswordInput
            autoComplete="new-password"
            id={confirmationName}
            name={confirmationName}
            placeholder={confirmation.placeholder ?? confirmation.label ?? "Confirm password"}
            passwordrules={passwordRules}
            required={getBooleanProp(node.props, "required")}
            tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
          />
        </FormFieldFrame>
      )}
    </div>
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

export const ChoiceComponent: LatticeRendererComponent<"form.choice"> = ({ node }) => {
  const { errors } = useLatticeForm();
  const name = getStringProp(node.props, "name");
  const options = useMemo(() => getChoiceOptions(node.props), [node.props]);
  const fallbackValue = options[0]?.value ?? "";
  const value = getStringProp(node.props, "value", fallbackValue);
  const event = getStringProp(node.props, "event");
  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  function selectOption(nextValue: string): void {
    setSelectedValue(nextValue);

    if (event) {
      window.dispatchEvent(
        new CustomEvent(event, {
          detail: {
            name,
            value: nextValue,
          },
        }),
      );
    }
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <FormFieldFrame error={errors[name]} label={getStringProp(node.props, "label")} name={name}>
      <input name={name} type="hidden" value={selectedValue} />
      <div
        aria-label={getStringProp(node.props, "label")}
        className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1"
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <button
              aria-checked={isSelected}
              className={cn(
                "whitespace-nowrap rounded-lt-sm px-3 py-1.5 text-sm font-medium transition-colors",
                isSelected
                  ? "bg-lt-bg text-lt-fg shadow-xs"
                  : "text-lt-muted-fg hover:bg-lt-bg/60 hover:text-lt-fg",
              )}
              key={option.value}
              onClick={() => selectOption(option.value)}
              role="radio"
              tabIndex={getOptionalNumberProp(node.props, "tabIndex")}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </FormFieldFrame>
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
