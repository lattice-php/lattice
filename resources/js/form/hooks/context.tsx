import { createContext, useContext } from "react";
import type { Option } from "@lattice-php/lattice/core/types";

type FormContextValue = {
  action: string;
  clearErrors: (field: string) => void;
  componentId?: string;
  componentRef: string;
  errors: Record<string, string | undefined>;
  fieldIdPrefix?: string;
  fieldLabels: Record<string, string>;
  precognitive: boolean;
  processing: boolean;
  searchOptions?: (
    field: string,
    query: string,
    values: Record<string, unknown>,
    signal: AbortSignal,
  ) => Promise<Option[]>;
  touch: (fields: string[]) => void;
  validate: (field: string) => void;
  validateFields: (
    fields: string[],
    options?: { onSuccess?: () => void; onValidationError?: () => void },
  ) => void;
  validating: boolean;
};

const FormContext = createContext<FormContextValue>({
  action: "#",
  clearErrors: () => {},
  componentId: undefined,
  componentRef: "",
  errors: {},
  fieldIdPrefix: undefined,
  fieldLabels: {},
  precognitive: false,
  processing: false,
  touch: () => {},
  validate: () => {},
  validateFields: () => {},
  validating: false,
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
