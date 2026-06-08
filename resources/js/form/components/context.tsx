import { createContext, useContext } from "react";

type LatticeFormContextValue = {
  errors: Record<string, string | undefined>;
  processing: boolean;
};

const LatticeFormContext = createContext<LatticeFormContextValue>({
  errors: {},
  processing: false,
});

export function LatticeFormProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: LatticeFormContextValue;
}) {
  return <LatticeFormContext.Provider value={value}>{children}</LatticeFormContext.Provider>;
}

export function useLatticeForm() {
  return useContext(LatticeFormContext);
}
