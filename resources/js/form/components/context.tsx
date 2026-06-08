import { createContext, useContext } from "react";

type FormContextValue = {
  errors: Record<string, string | undefined>;
  processing: boolean;
};

const FormContext = createContext<FormContextValue>({
  errors: {},
  processing: false,
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
