import { createContext, useContext } from "react";

export type PrefillController = {
  /** Mark a field path as user-owned so resolver-supplied values stop overwriting it. */
  markUserEdit: (path: string) => void;
};

const PrefillContext = createContext<PrefillController | null>(null);

export const PrefillProvider = PrefillContext.Provider;

export function usePrefillController(): PrefillController | null {
  return useContext(PrefillContext);
}
