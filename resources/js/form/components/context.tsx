import { createContext, useContext } from "react";

type FormContextValue = {
  action: string;
  clearErrors: (field: string) => void;
  componentRef: string;
  errors: Record<string, string | undefined>;
  fieldLabels: Record<string, string>;
  invalid: (field: string) => boolean;
  precognitive: boolean;
  processing: boolean;
  touch: (field: string) => void;
  validate: (field: string) => void;
  validating: boolean;
  valid: (field: string) => boolean;
};

const FormContext = createContext<FormContextValue>({
  action: "#",
  clearErrors: () => {},
  componentRef: "",
  errors: {},
  fieldLabels: {},
  invalid: () => false,
  precognitive: false,
  processing: false,
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
