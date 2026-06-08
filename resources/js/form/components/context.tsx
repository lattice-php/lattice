import { createContext, useContext } from "react";

type FormContextValue = {
  errors: Record<string, string | undefined>;
  processing: boolean;
};

const LatticeFormContext = createContext<FormContextValue>({
  errors: {},
  processing: false,
});

export function LatticeFormProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FormContextValue;
}) {
  return <LatticeFormContext.Provider value={value}>{children}</LatticeFormContext.Provider>;
}

export function useLatticeForm() {
  return useContext(LatticeFormContext);
}
