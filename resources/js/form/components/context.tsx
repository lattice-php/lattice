import { createContext, useContext } from "react";

type FormContextValue = {
  clearErrors: (field: string) => void;
  errors: Record<string, string | undefined>;
  fieldLabels: Record<string, string>;
  invalid: (field: string) => boolean;
  precognitive: boolean;
  processing: boolean;
  state: Record<string, unknown>;
  touch: (field: string) => void;
  validate: (field: string) => void;
  validating: boolean;
  valid: (field: string) => boolean;
};

const FormContext = createContext<FormContextValue>({
  clearErrors: () => {},
  errors: {},
  fieldLabels: {},
  invalid: () => false,
  precognitive: false,
  processing: false,
  state: {},
  touch: () => {},
  validate: () => {},
  validating: false,
  valid: () => false,
});

export function FormProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FormContextValue;
}) {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  return useContext(FormContext);
}

export function useFormFieldValue(name: string): unknown {
  return useFormContext().state[name];
}
