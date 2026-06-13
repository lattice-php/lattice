import { createContext, useContext } from "react";

export type PrefillController = {
  markUserEdit: (overrideKey: string) => void;
};

const PrefillContext = createContext<PrefillController | null>(null);

export const PrefillProvider = PrefillContext.Provider;

export function usePrefillController(): PrefillController | null {
  return useContext(PrefillContext);
}
