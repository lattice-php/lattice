import { createContext, useContext } from "react";

type FormContextValue = {
  action: string;
  clearErrors: (field: string) => void;
  componentId?: string;
  componentRef: string;
  errors: Record<string, string | undefined>;
  fieldLabels: Record<string, string>;
  precognitive: boolean;
  processing: boolean;
  validate: (field: string) => void;
};

const FormContext = createContext<FormContextValue>({
  action: "#",
  clearErrors: () => {},
  componentId: undefined,
  componentRef: "",
  errors: {},
  fieldLabels: {},
  precognitive: false,
  processing: false,
  validate: () => {},
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
